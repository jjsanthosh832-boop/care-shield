package com.insurance.portal.controller;

import com.fasterxml.jackson.annotation.JsonProperty;

public class RegisterRequest {
    @JsonProperty("fullName")
    private String fullName;
    
    @JsonProperty("email")
    private String email;
    
    @JsonProperty("mobile")
    private String mobile;
    
    @JsonProperty("password")
    private String password;
    
    @JsonProperty("address")
    private String address;
    
    @JsonProperty("role")
    private String role;

    public RegisterRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}