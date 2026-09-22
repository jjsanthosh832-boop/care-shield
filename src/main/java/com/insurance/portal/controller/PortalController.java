package com.insurance.portal.controller;

import com.insurance.portal.model.Claim;
import com.insurance.portal.model.ClaimDocument;
import com.insurance.portal.model.Notification;
import com.insurance.portal.model.Policy;
import com.insurance.portal.model.User;
import com.insurance.portal.repository.ClaimDocumentRepository;
import com.insurance.portal.repository.ClaimRepository;
import com.insurance.portal.repository.NotificationRepository;
import com.insurance.portal.repository.PolicyRepository;
import com.insurance.portal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.Base64;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class PortalController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PolicyRepository policyRepository;

    @Autowired
    private ClaimRepository claimRepository;

    @Autowired
    private ClaimDocumentRepository claimDocumentRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Value("${app.admin-email:}")
    private String bootstrapAdminEmail;

    private boolean isBootstrapAdmin(String email) {
        return email != null && !bootstrapAdminEmail.isBlank()
                && bootstrapAdminEmail.equalsIgnoreCase(email.trim());
    }

    private void ensureBootstrapAdmin(User user) {
        if (isBootstrapAdmin(user.getEmail()) && !"ADMIN".equals(user.getRole())) {
            user.setRole("ADMIN");
            userRepository.save(user);
        }
    }

    // Login - accepts email OR mobile
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String login = credentials.get("login");
        if (login == null) {
            login = credentials.get("emailOrMobile");
        }
        if (login == null) {
            login = credentials.get("email");
        }
        if (login == null) {
            login = credentials.get("mobile");
        }
        String password = credentials.get("password");

        if (login == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Login and password required"));
        }

        Optional<User> userOpt = userRepository.findByEmail(login);
        if (!userOpt.isPresent()) {
            userOpt = userRepository.findByMobile(login);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getPassword().equals(password)) {
                ensureBootstrapAdmin(user);
                Map<String, Object> response = new HashMap<>();
                response.put("id", user.getId());
                response.put("email", user.getEmail());
                response.put("mobile", user.getMobile());
                response.put("fullName", user.getFullName());
                response.put("role", user.getRole());
                response.put("address", user.getAddress());
                response.put("twoFactorEnabled", user.isTwoFactorEnabled());
                return ResponseEntity.ok(response);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Invalid credentials"));
    }

    // Register
    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest userData) {
        String email = userData.getEmail();
        String password = userData.getPassword();
        String fullName = userData.getFullName();
        String mobile = userData.getMobile();
        String address = userData.getAddress();

        if (email == null || email.trim().isEmpty() || password == null || password.trim().isEmpty()
                || fullName == null || fullName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "All required fields must be filled"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered"));
        }

        if (mobile != null && !mobile.trim().isEmpty() && userRepository.findByMobile(mobile).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mobile number already registered"));
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(password);
        user.setFullName(fullName);
        // Everyone registers as USER - only an ADMIN can grant ADMIN via /admin/users/{id}/role.
        // (The bootstrap admin email is auto-elevated at login.)
        user.setRole("USER");
        user.setMobile(mobile);
        user.setAddress(address);

        User savedUser = userRepository.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("email", savedUser.getEmail());
        response.put("mobile", savedUser.getMobile());
        response.put("fullName", savedUser.getFullName());
        response.put("role", savedUser.getRole());
        response.put("address", savedUser.getAddress());
        response.put("twoFactorEnabled", savedUser.isTwoFactorEnabled());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get policies for user
    @GetMapping("/policies")
    public ResponseEntity<?> getPolicies(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        List<Policy> policies = policyRepository.findByUser(userOpt.get());
        return ResponseEntity.ok(policies);
    }

    // Purchase policy
    @PostMapping("/policies/purchase")
    public ResponseEntity<?> purchasePolicy(@RequestBody Map<String, Object> policyData) {
        try {
            Long userId = Long.valueOf(policyData.get("userId").toString());
            String policyName = policyData.get("policyName").toString();
            String policyTypeRaw = policyData.get("policyType") != null ? policyData.get("policyType").toString() : "Health";
            String policyType = policyTypeRaw.trim().isEmpty() ? "Health" : policyTypeRaw;
            Double coverageLimit = Double.valueOf(policyData.get("coverageLimit").toString());
            Double deductible = Double.valueOf(policyData.get("deductible").toString());
            Double premiumAmount = Double.valueOf(policyData.get("premiumAmount").toString());

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }

            String policyNumber = "POL-" + (int)(Math.random() * 90000 + 10000) + "-" + policyType.substring(0, 1).toUpperCase();

            Policy policy = new Policy();
            policy.setPolicyNumber(policyNumber);
            policy.setPolicyName(policyName);
            policy.setPolicyType(policyType);
            policy.setCoverageLimit(coverageLimit);
            policy.setRemainingBalance(coverageLimit);
            policy.setDeductible(deductible);
            policy.setPremiumAmount(premiumAmount);
            policy.setStatus("Active");
            policy.setStartDate(LocalDate.now());
            policy.setEndDate(LocalDate.now().plusYears(1));
            policy.setUser(userOpt.get());

            Policy savedPolicy = policyRepository.save(policy);

            // Notify user
            createNotification(userOpt.get(), "You are now enrolled in " + policyName + " (" + policyNumber + ")", "POLICY_PURCHASE");

            return ResponseEntity.status(HttpStatus.CREATED).body(savedPolicy);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to enroll: " + e.getMessage()));
        }
    }

    // Get claims (user or admin)
    @GetMapping("/claims")
    public ResponseEntity<?> getClaims(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        List<Claim> claims;
        if ("ADMIN".equals(user.getRole())) {
            claims = claimRepository.findByOrderBySubmissionDateDesc();
        } else {
            claims = claimRepository.findByUser(user);
        }
        return ResponseEntity.ok(claims);
    }

    // Track claim by claim number (public) - supports both /number/ and /track/ paths (frontend uses /track/)
    @GetMapping({"/claims/number/{claimNumber}", "/claims/track/{claimNumber}"})
    public ResponseEntity<?> trackClaim(@PathVariable String claimNumber) {
        Optional<Claim> claimOpt = claimRepository.findByClaimNumber(claimNumber);
        if (claimOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Claim not found"));
        }
        return ResponseEntity.ok(claimOpt.get());
    }

    // Submit claim with multiple documents
    @PostMapping(value = "/claims", consumes = {"multipart/form-data"})
    public ResponseEntity<?> submitClaim(
            @RequestParam("userId") Long userId,
            @RequestParam("policyNumber") String policyNumber,
            @RequestParam("claimType") String claimType,
            @RequestParam("provider") String provider,
            @RequestParam("hospitalAddress") String hospitalAddress,
            @RequestParam("admissionDate") String admissionDate,
            @RequestParam("dischargeDate") String dischargeDate,
            @RequestParam("claimAmount") Double claimAmount,
            @RequestParam("description") String description,
            @RequestParam(value = "documents", required = false) List<MultipartFile> documents,
            @RequestParam(value = "documentTypes", required = false) List<String> documentTypes) {

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
            }

            Optional<Policy> policyOpt = policyRepository.findByPolicyNumber(policyNumber);
            if (policyOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid policy number"));
            }

            Policy policy = policyOpt.get();
            if (claimAmount > policy.getRemainingBalance()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Claim amount exceeds remaining balance (₹" + policy.getRemainingBalance() + ")"));
            }

            Claim claim = new Claim();
            claim.setUser(userOpt.get());
            claim.setPolicyNumber(policyNumber);
            claim.setClaimType(claimType);
            claim.setProvider(provider);
            claim.setHospitalAddress(hospitalAddress);
            claim.setAdmissionDate(LocalDate.parse(admissionDate));
            claim.setDischargeDate(LocalDate.parse(dischargeDate));
            claim.setServiceDate(LocalDate.parse(admissionDate)); // for display
            claim.setClaimAmount(claimAmount);
            claim.setDescription(description);
            claim.setStatus("Submitted");
            claim.setSubmissionDate(LocalDate.now());
            claim.setRemarks("");

            // Generate claim number CLM-YYYY-NNN
            int year = LocalDate.now().getYear();
            LocalDate yearStart = LocalDate.of(year, 1, 1);
            LocalDate yearEnd = LocalDate.of(year, 12, 31);
            long count = claimRepository.countBySubmissionDateBetween(yearStart, yearEnd);
            claim.setClaimNumber(String.format("CLM-%d-%03d", year, count + 1));

            Claim savedClaim = claimRepository.save(claim);

            // Process documents
            if (documents != null && !documents.isEmpty()) {
                for (int i = 0; i < documents.size(); i++) {
                    MultipartFile file = documents.get(i);
                    if (!file.isEmpty()) {
                        ClaimDocument doc = new ClaimDocument();
                        doc.setClaim(savedClaim);
                        doc.setFileName(file.getOriginalFilename());
                        doc.setFileType(file.getContentType());
                        String type = (documentTypes != null && i < documentTypes.size())
                                ? documentTypes.get(i) : "MEDICAL_DOCUMENT";
                        doc.setDocumentType(type);
                        String base64 = Base64.getEncoder().encodeToString(file.getBytes());
                        doc.setDocumentBase64(base64);
                        claimDocumentRepository.save(doc);
                        savedClaim.getDocuments().add(doc);
                    }
                }
            }

    // Notifications
            createNotification(userOpt.get(), "Your claim " + savedClaim.getClaimNumber() + " has been submitted. Awaiting review.", "CLAIM_SUBMITTED");

            List<User> admins = userRepository.findByRole("ADMIN");
            for (User admin : admins) {
                createNotification(admin, "New claim " + savedClaim.getClaimNumber() + " by " + userOpt.get().getFullName() + " (₹" + claimAmount + ") awaiting review.", "CLAIM_SUBMITTED");
            }

            return ResponseEntity.status(HttpStatus.CREATED).body(savedClaim);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Failed to process claim: " + e.getMessage()));
        }
    }

    // Update claim status (admin)
    @PutMapping("/claims/{id}/status")
    @Transactional
    public ResponseEntity<?> updateClaimStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {

        Optional<Claim> claimOpt = claimRepository.findById(id);
        if (claimOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Claim not found"));
        }

        Claim claim = claimOpt.get();
        String newStatus = statusUpdate.get("status");
        String remarks = statusUpdate.getOrDefault("remarks", "");

        if (!Arrays.asList("Under Review", "Approved", "Rejected", "Settled").contains(newStatus)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid status"));
        }

        // Deduct balance only when moving TO Approved from non-approved
        boolean isNewlyApproved = "Approved".equalsIgnoreCase(newStatus) && !"Approved".equalsIgnoreCase(claim.getStatus());
        if (isNewlyApproved) {
            Optional<Policy> policyOpt = policyRepository.findByPolicyNumber(claim.getPolicyNumber());
            if (policyOpt.isPresent()) {
                Policy policy = policyOpt.get();
                if (claim.getClaimAmount() > policy.getRemainingBalance()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Insufficient remaining balance"));
                }
                policy.setRemainingBalance(policy.getRemainingBalance() - claim.getClaimAmount());
                policyRepository.save(policy);
            }
        }

        claim.setStatus(newStatus);
        claim.setRemarks(remarks);
        Claim updatedClaim = claimRepository.save(claim);

        // Notify owner
        String message;
        switch (newStatus) {
            case "Approved" -> message = "Your claim " + claim.getClaimNumber() + " has been approved. ₹" + claim.getClaimAmount() + " will be disbursed.";
            case "Rejected" -> message = "Your claim " + claim.getClaimNumber() + " was rejected. " + remarks;
            case "Settled" -> message = "Your claim " + claim.getClaimNumber() + " has been settled and reimbursement is complete.";
            default -> message = "Your claim " + claim.getClaimNumber() + " is now under review.";
        }
        createNotification(claim.getUser(), message, "CLAIM_UPDATE");

        return ResponseEntity.ok(updatedClaim);
    }

    // Get document metadata for a claim
    @GetMapping("/claims/{id}/documents")
    public ResponseEntity<?> getClaimDocuments(@PathVariable Long id) {
        Optional<Claim> claimOpt = claimRepository.findById(id);
        if (claimOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Claim not found"));
        }
        Claim claim = claimOpt.get();
        List<Map<String, Object>> docs = claim.getDocuments().stream().map(d -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", d.getId());
            m.put("documentType", d.getDocumentType());
            m.put("fileName", d.getFileName());
            m.put("fileType", d.getFileType());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(docs);
    }

    // Get single document content by document id
    @GetMapping("/claims/documents/{docId}")
    public ResponseEntity<?> getDocument(@PathVariable Long docId) {
        Optional<ClaimDocument> docOpt = claimDocumentRepository.findById(docId);
        if (docOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Document not found"));
        }
        ClaimDocument doc = docOpt.get();
        Map<String, Object> response = new HashMap<>();
        response.put("documentType", doc.getDocumentType());
        response.put("fileName", doc.getFileName());
        response.put("fileType", doc.getFileType());
        response.put("documentBase64", doc.getDocumentBase64());
        return ResponseEntity.ok(response);
    }

    // Singular alias used by frontend useClaimDocument(claimId): returns metadata list for the claim
    @GetMapping("/claims/{claimId}/document")
    public ResponseEntity<?> getClaimDocumentSingular(@PathVariable Long claimId) {
        return getClaimDocuments(claimId);
    }

    // Notifications
    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(userOpt.get());
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/notifications/unread-count")
    public ResponseEntity<?> getUnreadCount(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        long count = notificationRepository.countByUserAndIsReadFalse(userOpt.get());
        return ResponseEntity.ok(count);
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Notification not found"));
        }
        Notification n = notifOpt.get();
        n.setRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PutMapping({"/notifications/read-all", "/notifications/mark-all-read"})
    public ResponseEntity<?> markAllRead(@RequestParam Long userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        List<Notification> unread = notificationRepository.findByUserOrderByCreatedAtDesc(userOpt.get())
                .stream().filter(n -> !n.isRead()).collect(Collectors.toList());
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok(Map.of("success", true));
    }

    // Admin endpoints
    @GetMapping("/admin/stats")
    public ResponseEntity<?> adminStats() {
        long users = userRepository.count();
        long policies = policyRepository.count();
        long claims = claimRepository.count();
        long pending = claimRepository.findByOrderBySubmissionDateDesc().stream()
                .filter(c -> "Submitted".equals(c.getStatus()) || "Under Review".equals(c.getStatus())).count();
        long approved = claimRepository.findByOrderBySubmissionDateDesc().stream()
                .filter(c -> "Approved".equals(c.getStatus()) || "Settled".equals(c.getStatus())).count();
        long rejected = claimRepository.findByOrderBySubmissionDateDesc().stream()
                .filter(c -> "Rejected".equals(c.getStatus())).count();
        double outflow = claimRepository.findByOrderBySubmissionDateDesc().stream()
                .filter(c -> "Approved".equals(c.getStatus()) || "Settled".equals(c.getStatus()))
                .mapToDouble(Claim::getClaimAmount).sum();

        Map<String, Object> stats = new HashMap<>();
        stats.put("users", users);
        stats.put("totalUsers", users);
        stats.put("policies", policies);
        stats.put("totalPolicies", policies);
        stats.put("totalClaims", claims);
        stats.put("pendingClaims", pending);
        stats.put("pending", pending);
        stats.put("approvedClaims", approved);
        stats.put("approvedToday", approved);
        stats.put("rejectedClaims", rejected);
        stats.put("totalOutflow", outflow);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin/users")
    public ResponseEntity<?> adminUsers() {
        List<User> users = userRepository.findAll();
        return ResponseEntity.ok(users.stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("mobile", u.getMobile());
            m.put("role", u.getRole());
            m.put("policyCount", u.getPolicies() != null ? u.getPolicies().size() : 0);
            m.put("claimCount", u.getClaims() != null ? u.getClaims().size() : 0);
            return m;
        }).collect(Collectors.toList()));
    }

    // Promote/demote a user - ADMIN only. The bootstrap admin's role can never be changed.
    @PutMapping("/admin/users/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-ID", required = false) Long requesterId) {

        if (requesterId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Admin access required"));
        }
        Optional<User> requesterOpt = userRepository.findById(requesterId);
        if (requesterOpt.isEmpty() || !"ADMIN".equals(requesterOpt.get().getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Admin access required"));
        }

        Optional<User> targetOpt = userRepository.findById(id);
        if (targetOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        User target = targetOpt.get();

        if (isBootstrapAdmin(target.getEmail())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "The master admin role cannot be changed"));
        }
        if (target.getId().equals(requesterId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You cannot change your own role"));
        }

        String newRole = body.getOrDefault("role", "").trim().toUpperCase();
        if (!"ADMIN".equals(newRole) && !"USER".equals(newRole)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Role must be ADMIN or USER"));
        }

        target.setRole(newRole);
        User saved = userRepository.save(target);
        createNotification(saved,
                "ADMIN".equals(newRole)
                        ? "You have been granted ADMIN access by " + requesterOpt.get().getFullName() + "."
                        : "Your ADMIN access has been revoked by " + requesterOpt.get().getFullName() + ".",
                "ROLE_UPDATE");

        return ResponseEntity.ok(Map.of("id", saved.getId(), "email", saved.getEmail(), "role", saved.getRole()));
    }

    @GetMapping("/admin/policies")
    public ResponseEntity<?> adminPolicies() {
        List<Policy> policies = policyRepository.findAll();
        return ResponseEntity.ok(policies.stream().map(p -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", p.getId());
            m.put("policyNumber", p.getPolicyNumber());
            m.put("policyName", p.getPolicyName());
            m.put("policyType", p.getPolicyType());
            m.put("owner", p.getUser() != null ? p.getUser().getFullName() : "N/A");
            m.put("coverageLimit", p.getCoverageLimit());
            m.put("remainingBalance", p.getRemainingBalance());
            m.put("status", p.getStatus());
            m.put("startDate", p.getStartDate());
            m.put("endDate", p.getEndDate());
            return m;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/admin/reports")
    public ResponseEntity<?> adminReports() {
        List<Claim> allClaims = claimRepository.findAll();

        // Monthly aggregation
        Map<String, Map<String, Object>> monthly = new LinkedHashMap<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = LocalDate.now().minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            String key = monthStart.toString().substring(0, 7);
            Map<String, Object> m = new HashMap<>();
            m.put("month", key);
            m.put("claims", 0);
            m.put("approved", 0);
            m.put("amount", 0.0);
            m.put("disbursed", 0.0);
            monthly.put(key, m);
        }

        for (Claim c : allClaims) {
            String key = c.getSubmissionDate().toString().substring(0, 7);
            Map<String, Object> m = monthly.getOrDefault(key, new HashMap<>());
            m.put("claims", (int)m.getOrDefault("claims", 0) + 1);
            m.put("amount", (double)m.getOrDefault("amount", 0.0) + c.getClaimAmount());
            if ("Approved".equals(c.getStatus()) || "Settled".equals(c.getStatus())) {
                m.put("approved", (int)m.getOrDefault("approved", 0) + 1);
                m.put("disbursed", (double)m.getOrDefault("disbursed", 0.0) + c.getClaimAmount());
            }
            monthly.put(key, m);
        }

        // Provider aggregation
        Map<String, Map<String, Object>> providers = new HashMap<>();
        for (Claim c : allClaims) {
            Map<String, Object> m = providers.computeIfAbsent(c.getProvider(), k -> {
                Map<String, Object> p = new HashMap<>();
                p.put("provider", k);
                p.put("claims", 0);
                p.put("approvedAmount", 0.0);
                return p;
            });
            m.put("claims", (int)m.getOrDefault("claims", 0) + 1);
            if ("Approved".equals(c.getStatus()) || "Settled".equals(c.getStatus())) {
                m.put("approvedAmount", (double)m.getOrDefault("approvedAmount", 0.0) + c.getClaimAmount());
            }
        }

        Map<String, Object> report = new HashMap<>();
        report.put("monthly", new ArrayList<>(monthly.values()));
        report.put("byProvider", new ArrayList<>(providers.values()));

        // Frontend-compatible shapes (AdminReportsPage expects monthlyClaims/claimsByProvider with count keys)
        List<Map<String, Object>> monthlyClaims = new ArrayList<>();
        for (Map<String, Object> m : monthly.values()) {
            Map<String, Object> mc = new HashMap<>();
            mc.put("month", m.get("month"));
            mc.put("count", m.get("claims"));
            mc.put("claims", m.get("claims"));
            mc.put("approved", m.get("approved"));
            mc.put("amount", m.get("amount"));
            mc.put("disbursed", m.get("disbursed"));
            monthlyClaims.add(mc);
        }
        List<Map<String, Object>> claimsByProvider = new ArrayList<>();
        for (Map<String, Object> p : providers.values()) {
            Map<String, Object> cp = new HashMap<>();
            cp.put("provider", p.get("provider"));
            cp.put("count", p.get("claims"));
            cp.put("claims", p.get("claims"));
            cp.put("approvedAmount", p.get("approvedAmount"));
            claimsByProvider.add(cp);
        }
        report.put("monthlyClaims", monthlyClaims);
        report.put("claimsByProvider", claimsByProvider);

        long totalClaims = allClaims.size();
        long totalApproved = allClaims.stream()
                .filter(c -> "Approved".equals(c.getStatus()) || "Settled".equals(c.getStatus())).count();
        long totalRejected = allClaims.stream()
                .filter(c -> "Rejected".equals(c.getStatus())).count();
        double totalOutflow = allClaims.stream()
                .filter(c -> "Approved".equals(c.getStatus()) || "Settled".equals(c.getStatus()))
                .mapToDouble(Claim::getClaimAmount).sum();
        report.put("totalClaims", totalClaims);
        report.put("totalApproved", totalApproved);
        report.put("totalRejected", totalRejected);
        report.put("totalOutflow", totalOutflow);
        return ResponseEntity.ok(report);
    }

    // Profile update
    @PutMapping("/users/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody Map<String, String> profileData) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }
        User user = userOpt.get();

        if (profileData.containsKey("fullName")) user.setFullName(profileData.get("fullName"));
        if (profileData.containsKey("mobile")) user.setMobile(profileData.get("mobile"));
        if (profileData.containsKey("address")) user.setAddress(profileData.get("address"));
        if (profileData.containsKey("password") && !profileData.get("password").trim().isEmpty()) {
            user.setPassword(profileData.get("password"));
        }
        if (profileData.containsKey("twoFactorEnabled")) {
            user.setTwoFactorEnabled(Boolean.parseBoolean(profileData.get("twoFactorEnabled")));
        }

        User saved = userRepository.save(user);
        Map<String, Object> response = new HashMap<>();
        response.put("id", saved.getId());
        response.put("email", saved.getEmail());
        response.put("mobile", saved.getMobile());
        response.put("fullName", saved.getFullName());
        response.put("role", saved.getRole());
        response.put("address", saved.getAddress());
        response.put("twoFactorEnabled", saved.isTwoFactorEnabled());
        return ResponseEntity.ok(response);
    }

    private void createNotification(User user, String message, String type) {
        Notification n = new Notification();
        n.setUser(user);
        n.setMessage(message);
        n.setType(type);
        n.setRead(false);
        n.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(n);
    }
}