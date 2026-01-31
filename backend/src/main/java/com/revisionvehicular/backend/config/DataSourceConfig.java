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

@Configuration
public class DataSourceConfig {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String defaultUsername;

    @Value("${spring.datasource.password}")
    private String defaultPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
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
                    return createDataSource(user, password);
                }
                return super.determineTargetDataSource();
            }
        };

        Map<Object, Object> dataSources = new HashMap<>();
        dataSources.put("default", createDataSource(defaultUsername, defaultPassword));

        routingDataSource.setTargetDataSources(dataSources);
        routingDataSource.setDefaultTargetDataSource(createDataSource(defaultUsername, defaultPassword));
        routingDataSource.afterPropertiesSet();

        return routingDataSource;
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