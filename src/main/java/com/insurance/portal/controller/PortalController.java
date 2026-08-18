package com.insurance.portal.controller;

import com.insurance.portal.model.Claim;
import com.insurance.portal.model.Policy;
import com.insurance.portal.model.User;
import com.insurance.portal.repository.ClaimRepository;
import com.insurance.portal.repository.PolicyRepository;
import com.insurance.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend integration
public class PortalController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private ClaimRepository claimRepository;

    // Login API
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password)) {
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("email", user.getEmail());
                response.put("fullName", user.getFullName());
                response.put("role", user.getRole());
                return ResponseEntity.ok(response);
            }
        }
        Map<String, String> error = new HashMap<>();
        error.put("message", "Invalid email or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // Get policies for a user
    @GetMapping("/policies")
    public ResponseEntity<?> getPolicies(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            List<Policy> policies = policyRepository.findByUser(userOpt.get());
            return ResponseEntity.ok(policies);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
    }

    // Get claims (filtered by user if USER role, or all if ADMIN)
    @GetMapping("/claims")
    public ResponseEntity<?> getClaims(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        if ("ADMIN".equals(user.getRole())) {
            // Admin sees all claims, sorted by submission date descending
            List<Claim> allClaims = claimRepository.findByOrderBySubmissionDateDesc();
            return ResponseEntity.ok(allClaims);
        } else {
            // Regular user sees their own claims
            List<Claim> userClaims = claimRepository.findByUser(user);
            return ResponseEntity.ok(userClaims);
        }
    }

    // Submit a claim with optional file upload
    @PostMapping(value = "/claims", consumes = {"multipart/form-data"})
    public ResponseEntity<?> submitClaim(
            @RequestParam("userId") Long userId,
            @RequestParam("policyNumber") String policyNumber,
            @RequestParam("claimAmount") Double claimAmount,
            @RequestParam("serviceDate") String serviceDate,
            @RequestParam("provider") String provider,
            @RequestParam("description") String description,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            Optional<Policy> policyOpt = policyRepository.findByPolicyNumber(policyNumber);
            if (!policyOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid policy number");
            }

            Policy policy = policyOpt.get();
            if (claimAmount > policy.getRemainingBalance()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Claim amount exceeds the policy remaining balance ($" + policy.getRemainingBalance() + ")");
            }

            Claim claim = new Claim();
            claim.setUser(userOpt.get());
            claim.setPolicyNumber(policyNumber);
            claim.setClaimAmount(claimAmount);
            claim.setServiceDate(LocalDate.parse(serviceDate));
            claim.setProvider(provider);
            claim.setDescription(description);
            claim.setStatus("Pending");
            claim.setSubmissionDate(LocalDate.now());
            claim.setRemarks("");

            // Process attachment if present
            if (file != null && !file.isEmpty()) {
                claim.setFileName(file.getOriginalFilename());
                claim.setFileType(file.getContentType());
                String base64Content = Base64.getEncoder().encodeToString(file.getBytes());
                claim.setDocumentBase64(base64Content);
            }

            Claim savedClaim = claimRepository.save(claim);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedClaim);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process claim: " + e.getMessage());
        }
    }

    // Admin updates claim status (Approve / Reject)
    @PutMapping("/claims/{id}/status")
    public ResponseEntity<?> updateClaimStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {

        Optional<Claim> claimOpt = claimRepository.findById(id);
        if (!claimOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Claim not found");
        }

        Claim claim = claimOpt.get();
        String newStatus = statusUpdate.get("status");
        String remarks = statusUpdate.get("remarks");

        if (!"Approved".equalsIgnoreCase(newStatus) && !"Rejected".equalsIgnoreCase(newStatus)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status. Must be 'Approved' or 'Rejected'");
        }

        // Deduct from remaining balance if approved (only do it if the claim was not already approved)
        if ("Approved".equalsIgnoreCase(newStatus) && !"Approved".equalsIgnoreCase(claim.getStatus())) {
            Optional<Policy> policyOpt = policyRepository.findByPolicyNumber(claim.getPolicyNumber());
            if (policyOpt.isPresent()) {
                Policy policy = policyOpt.get();
                if (claim.getClaimAmount() > policy.getRemainingBalance()) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Claim amount exceeds the policy remaining balance ($" + policy.getRemainingBalance() + ")");
                }
                policy.setRemainingBalance(policy.getRemainingBalance() - claim.getClaimAmount());
                policyRepository.save(policy);
            }
        }

        claim.setStatus(newStatus);
        claim.setRemarks(remarks);
        Claim updatedClaim = claimRepository.save(claim);

        return ResponseEntity.ok(updatedClaim);
    }

    // Retrieve file download
    @GetMapping("/claims/{id}/document")
    public ResponseEntity<?> getClaimDocument(@PathVariable Long id) {
        Optional<Claim> claimOpt = claimRepository.findById(id);
        if (claimOpt.isPresent()) {
            Claim claim = claimOpt.get();
            if (claim.getDocumentBase64() != null) {
                Map<String, String> response = new HashMap<>();
                response.put("fileName", claim.getFileName());
                response.put("fileType", claim.getFileType());
                response.put("documentBase64", claim.getDocumentBase64());
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found");
    }

    // Register API
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> userData) {
        String email = userData.get("email");
        String password = userData.get("password");
        String fullName = userData.get("fullName");
        String role = userData.get("role");

        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty() || fullName == null || fullName.trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "All fields are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        if (userRepository.findByEmail(email).isPresent()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email is already registered");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(password);
        user.setFullName(fullName);
        user.setRole(role != null && !role.trim().isEmpty() ? role : "USER");

        User savedUser = userRepository.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("email", savedUser.getEmail());
        response.put("fullName", savedUser.getFullName());
        response.put("role", savedUser.getRole());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Purchase / Enroll Policy API
    @PostMapping("/policies/purchase")
    public ResponseEntity<?> purchasePolicy(@RequestBody Map<String, Object> policyData) {
        try {
            Long userId = Long.valueOf(policyData.get("userId").toString());
            String policyName = policyData.get("policyName").toString();
            String policyType = policyData.get("policyType").toString();
            Double coverageLimit = Double.valueOf(policyData.get("coverageLimit").toString());
            Double deductible = Double.valueOf(policyData.get("deductible").toString());
            Double premiumAmount = Double.valueOf(policyData.get("premiumAmount").toString());

            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
            }

            // Generate unique policy number
            String policyNumber = "POL-" + (int)(Math.random() * 90000 + 10000) + "-" + policyType.substring(0, 1).toUpperCase();
            
            Policy policy = new Policy();
            policy.setPolicyNumber(policyNumber);
            policy.setPolicyName(policyName);
            policy.setPolicyType(policyType);
            policy.setCoverageLimit(coverageLimit);
            policy.setRemainingBalance(coverageLimit); // initial balance equals coverage limit
            policy.setDeductible(deductible);
            policy.setPremiumAmount(premiumAmount);
            policy.setStatus("Active");
            policy.setUser(userOpt.get());

            Policy savedPolicy = policyRepository.save(policy);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPolicy);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to enroll in policy: " + e.getMessage());
        }
    }

    // Update Profile API
    @PutMapping("/users/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Map<String, String> profileData) {
        Optional<User> userOpt = userRepository.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        User user = userOpt.get();
        String fullName = profileData.get("fullName");
        String password = profileData.get("password");

        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName);
        }
        if (password != null && !password.trim().isEmpty()) {
            user.setPassword(password);
        }

        User updatedUser = userRepository.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("id", updatedUser.getId());
        response.put("email", updatedUser.getEmail());
        response.put("fullName", updatedUser.getFullName());
        response.put("role", updatedUser.getRole());

        return ResponseEntity.ok(response);
    }
}

