package com.revisionvehicular.backend.security;

public class UserDatabaseContext {

    private static final ThreadLocal<String> currentUser = new ThreadLocal<>();
    private static final ThreadLocal<String> currentPassword = new ThreadLocal<>();

    public static void setCredentials(String user, String password) {
        currentUser.set(user);
        currentPassword.set(password);
    }

    public static String getUser() {
        return currentUser.get();
    }

    public static String getPassword() {
        return currentPassword.get();
    }

    public static void clear() {
        currentUser.remove();
        currentPassword.remove();
    }
}