package com.insurance.portal.controller;

import com.fasterxml.jackson.annotation.JsonProperty;

public class LoginRequest {
    @JsonProperty("login")
    private String login;
    
    @JsonProperty("emailOrMobile")
    private String emailOrMobile;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("mobile")
    private String mobile;
    
    @JsonProperty("password")
    private String password;

    public LoginRequest() {}

    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }

    public String getEmailOrMobile() { return emailOrMobile; }
    public void setEmailOrMobile(String emailOrMobile) { this.emailOrMobile = emailOrMobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}