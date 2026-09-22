package com.insurance.portal.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "claims")
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String claimNumber;

    @Column(nullable = false)
    private String policyNumber;

    @Column(nullable = false)
    private LocalDate serviceDate;

    @Column(name = "admission_date")
    private LocalDate admissionDate;

    @Column(name = "discharge_date")
    private LocalDate dischargeDate;

    @Column(nullable = false)
    private Double claimAmount;

    @Column(nullable = false)
    private String provider;

    @Column(name = "hospital_address")
    private String hospitalAddress;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String claimType;

    @Column(nullable = false)
    private String status;

    private String remarks;

    @Column(nullable = false)
    private LocalDate submissionDate;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private List<ClaimDocument> documents = new ArrayList<>();

    private String fileName;
    private String fileType;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String documentBase64;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }

    public LocalDate getServiceDate() {
        return serviceDate;
    }

    public void setServiceDate(LocalDate serviceDate) {
        this.serviceDate = serviceDate;
    }

    public LocalDate getAdmissionDate() {
        return admissionDate;
    }

    public void setAdmissionDate(LocalDate admissionDate) {
        this.admissionDate = admissionDate;
    }

    public LocalDate getDischargeDate() {
        return dischargeDate;
    }

    public void setDischargeDate(LocalDate dischargeDate) {
        this.dischargeDate = dischargeDate;
    }

    public Double getClaimAmount() {
        return claimAmount;
    }

    public void setClaimAmount(Double claimAmount) {
        this.claimAmount = claimAmount;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public String getHospitalAddress() {
        return hospitalAddress;
    }

    public void setHospitalAddress(String hospitalAddress) {
        this.hospitalAddress = hospitalAddress;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getClaimType() {
        return claimType;
    }

    public void setClaimType(String claimType) {
        this.claimType = claimType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDate getSubmissionDate() {
        return submissionDate;
    }

    public void setSubmissionDate(LocalDate submissionDate) {
        this.submissionDate = submissionDate;
    }

    public List<ClaimDocument> getDocuments() {
        return documents;
    }

    public void setDocuments(List<ClaimDocument> documents) {
        this.documents = documents;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getDocumentBase64() {
        return documentBase64;
    }

    public void setDocumentBase64(String documentBase64) {
        this.documentBase64 = documentBase64;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}