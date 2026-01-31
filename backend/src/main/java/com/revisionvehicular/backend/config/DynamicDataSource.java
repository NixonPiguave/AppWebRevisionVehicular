package com.revisionvehicular.backend.config;

import com.revisionvehicular.backend.security.UserDatabaseContext;
import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;

public class DynamicDataSource extends AbstractRoutingDataSource {

    @Override
    protected Object determineCurrentLookupKey() {
        String user = UserDatabaseContext.getUser();
        return user != null ? user : "default";
    }
}