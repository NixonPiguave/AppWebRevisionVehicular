package com.revisionvehicular.backend.config;

import com.revisionvehicular.backend.security.UserDatabaseContext;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

import javax.sql.DataSource;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String defaultUsername;

    @Value("${spring.datasource.password}")
    private String defaultPassword;

    /**
     * Cache de DataSources por usuario para evitar crear un nuevo pool Hikari en cada petición.
     * Sin caché, cada request creaba un nuevo pool y se superaba el límite de conexiones de PostgreSQL.
     */
    private final Map<String, DataSource> dataSourceCache = new ConcurrentHashMap<>();

    private static final String DEFAULT_KEY = "default";

    @Bean
    @Primary
    public DataSource dataSource() {
        DataSource defaultDataSource = getOrCreateDataSource(DEFAULT_KEY, defaultUsername, defaultPassword);

        AbstractRoutingDataSource routingDataSource = new AbstractRoutingDataSource() {

            @Override
            protected Object determineCurrentLookupKey() {
                return UserDatabaseContext.getUser() != null ? "dynamic" : "default";
            }

            @Override
            protected DataSource determineTargetDataSource() {
                String user = UserDatabaseContext.getUser();
                String password = UserDatabaseContext.getPassword();

                if (user != null && password != null) {
                    return getOrCreateDataSource(user, user, password);
                }
                return super.determineTargetDataSource();
            }
        };

        Map<Object, Object> dataSources = new HashMap<>();
        dataSources.put("default", defaultDataSource);

        routingDataSource.setTargetDataSources(dataSources);
        routingDataSource.setDefaultTargetDataSource(defaultDataSource);
        routingDataSource.afterPropertiesSet();

        return routingDataSource;
    }

    /**
     * Obtiene un DataSource del caché o lo crea si no existe.
     * Evita crear cientos de pools Hikari que superan el límite de conexiones de PostgreSQL.
     */
    private DataSource getOrCreateDataSource(String cacheKey, String username, String password) {
        return dataSourceCache.computeIfAbsent(cacheKey, k -> createDataSource(username, password));
    }

    private DataSource createDataSource(String username, String password) {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(dbUrl);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(1);
        dataSource.setConnectionTimeout(30000);
        return dataSource;
    }
}