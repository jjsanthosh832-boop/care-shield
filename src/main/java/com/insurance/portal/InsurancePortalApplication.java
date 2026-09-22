package com.insurance.portal;

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
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@SpringBootApplication
public class InsurancePortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(InsurancePortalApplication.class, args);
    }

    @Bean
    public CommandLineRunner demoData(
            UserRepository userRepository,
            PolicyRepository policyRepository,
            ClaimRepository claimRepository,
            ClaimDocumentRepository claimDocumentRepository,
            NotificationRepository notificationRepository) {
        return args -> {
            // Master admin (jjsanthosh832@gmail.com) is always ADMIN, even on an existing database.
            userRepository.findByEmail("jjsanthosh832@gmail.com").ifPresent(u -> {
                if (!"ADMIN".equals(u.getRole())) {
                    u.setRole("ADMIN");
                    userRepository.save(u);
                    System.out.println("--- Promoted jjsanthosh832@gmail.com to ADMIN ---");
                }
            });
            // Skip seeding on persistent DBs (e.g. MySQL) when data already exists
            if (userRepository.count() > 0) {
                System.out.println("--- CareShield data already present, skipping demo seed ---");
                return;
            }
            System.out.println("--- Seeding CareShield Demo Data ---");

            // Create Users
            User santhosh = new User();
            santhosh.setEmail("santhosh@email.com");
            santhosh.setPassword("password");
            santhosh.setFullName("Santhosh A");
            santhosh.setRole("USER");
            santhosh.setMobile("+91 98765 43210");
            santhosh.setAddress("Chennai, Tamil Nadu");
            santhosh.setTwoFactorEnabled(false);

            User admin = new User();
            admin.setEmail("admin@example.com");
            admin.setPassword("password");
            admin.setFullName("Admin Reviewer");
            admin.setRole("ADMIN");
            admin.setMobile("+91 90000 00000");
            admin.setAddress("Head Office");

            userRepository.saveAll(Arrays.asList(santhosh, admin));

            // Policies
            Policy healthPolicy = new Policy();
            healthPolicy.setPolicyNumber("POL-10001");
            healthPolicy.setPolicyName("Health Secure Plus");
            healthPolicy.setPolicyType("Health");
            healthPolicy.setCoverageLimit(500000.0);
            healthPolicy.setRemainingBalance(375000.0);
            healthPolicy.setDeductible(0.0);
            healthPolicy.setPremiumAmount(48000.0);
            healthPolicy.setStatus("Active");
            healthPolicy.setStartDate(LocalDate.of(2026, 1, 1));
            healthPolicy.setEndDate(LocalDate.of(2026, 12, 31));
            healthPolicy.setUser(santhosh);

            Policy dentalPolicy = new Policy();
            dentalPolicy.setPolicyNumber("POL-10002");
            dentalPolicy.setPolicyName("Dental Care Plan");
            dentalPolicy.setPolicyType("Dental");
            dentalPolicy.setCoverageLimit(50000.0);
            dentalPolicy.setRemainingBalance(50000.0);
            dentalPolicy.setDeductible(2000.0);
            dentalPolicy.setPremiumAmount(12000.0);
            dentalPolicy.setStatus("Active");
            dentalPolicy.setStartDate(LocalDate.of(2026, 6, 1));
            dentalPolicy.setEndDate(LocalDate.of(2027, 5, 31));
            dentalPolicy.setUser(santhosh);

            policyRepository.saveAll(Arrays.asList(healthPolicy, dentalPolicy));

            // Claims
            // CLM-2025-009 - Approved 50000
            Claim claim1 = new Claim();
            claim1.setClaimNumber("CLM-2025-009");
            claim1.setPolicyNumber("POL-10001");
            claim1.setClaimType("REIMBURSEMENT");
            claim1.setProvider("Apollo Hospital");
            claim1.setHospitalAddress("21 Greams Road, Chennai");
            claim1.setAdmissionDate(LocalDate.of(2025, 3, 10));
            claim1.setDischargeDate(LocalDate.of(2025, 3, 15));
            claim1.setServiceDate(LocalDate.of(2025, 3, 10));
            claim1.setClaimAmount(50000.0);
            claim1.setDescription("Cardiac consultation and follow-up");
            claim1.setStatus("Approved");
            claim1.setRemarks("Approved as per policy coverage");
            claim1.setSubmissionDate(LocalDate.of(2025, 3, 16));
            claim1.setUser(santhosh);

            // CLM-2025-021 - Approved 60000
            Claim claim2 = new Claim();
            claim2.setClaimNumber("CLM-2025-021");
            claim2.setPolicyNumber("POL-10001");
            claim2.setClaimType("CASHLESS");
            claim2.setProvider("Apollo Hospital");
            claim2.setHospitalAddress("21 Greams Road, Chennai");
            claim2.setAdmissionDate(LocalDate.of(2025, 7, 20));
            claim2.setDischargeDate(LocalDate.of(2025, 7, 25));
            claim2.setServiceDate(LocalDate.of(2025, 7, 20));
            claim2.setClaimAmount(60000.0);
            claim2.setDescription("Angioplasty procedure");
            claim2.setStatus("Approved");
            claim2.setRemarks("Cashless approved at network hospital");
            claim2.setSubmissionDate(LocalDate.of(2025, 7, 26));
            claim2.setUser(santhosh);

            // CLM-2026-001 - Under Review 25000 (matches tracker mockup)
            Claim claim3 = new Claim();
            claim3.setClaimNumber("CLM-2026-001");
            claim3.setPolicyNumber("POL-10001");
            claim3.setClaimType("REIMBURSEMENT");
            claim3.setProvider("Apollo Hospital");
            claim3.setHospitalAddress("21 Greams Road, Chennai");
            claim3.setAdmissionDate(LocalDate.of(2026, 9, 10));
            claim3.setDischargeDate(LocalDate.of(2026, 9, 15));
            claim3.setServiceDate(LocalDate.of(2026, 9, 10));
            claim3.setClaimAmount(25000.0);
            claim3.setDescription("Cardiac consultation and angioplasty follow-up");
            claim3.setStatus("Under Review");
            claim3.setRemarks("");
            claim3.setSubmissionDate(LocalDate.of(2026, 9, 16));
            claim3.setUser(santhosh);

            // CLM-2026-002 - Approved 15000
            Claim claim4 = new Claim();
            claim4.setClaimNumber("CLM-2026-002");
            claim4.setPolicyNumber("POL-10001");
            claim4.setClaimType("REIMBURSEMENT");
            claim4.setProvider("Apollo Hospital");
            claim4.setHospitalAddress("21 Greams Road, Chennai");
            claim4.setAdmissionDate(LocalDate.of(2026, 8, 1));
            claim4.setDischargeDate(LocalDate.of(2026, 8, 5));
            claim4.setServiceDate(LocalDate.of(2026, 8, 1));
            claim4.setClaimAmount(15000.0);
            claim4.setDescription("Physiotherapy sessions post-surgery");
            claim4.setStatus("Approved");
            claim4.setRemarks("Approved as per physiotherapy benefit");
            claim4.setSubmissionDate(LocalDate.of(2026, 8, 6));
            claim4.setUser(santhosh);

            // CLM-2026-003 - Submitted 45000 (cashless pending)
            Claim claim5 = new Claim();
            claim5.setClaimNumber("CLM-2026-003");
            claim5.setPolicyNumber("POL-10001");
            claim5.setClaimType("CASHLESS");
            claim5.setProvider("MIOT International");
            claim5.setHospitalAddress("4/112, Mount Poonamallee Rd, Chennai");
            claim5.setAdmissionDate(LocalDate.of(2026, 9, 18));
            claim5.setDischargeDate(LocalDate.of(2026, 9, 22));
            claim5.setServiceDate(LocalDate.of(2026, 9, 18));
            claim5.setClaimAmount(45000.0);
            claim5.setDescription("Knee replacement surgery");
            claim5.setStatus("Submitted");
            claim5.setRemarks("");
            claim5.setSubmissionDate(LocalDate.of(2026, 9, 23));
            claim5.setUser(santhosh);

            // CLM-2026-004 - Rejected 8000 (dental)
            Claim claim6 = new Claim();
            claim6.setClaimNumber("CLM-2026-004");
            claim6.setPolicyNumber("POL-10002");
            claim6.setClaimType("REIMBURSEMENT");
            claim6.setProvider("Smile Dental Clinic");
            claim6.setHospitalAddress("123 Anna Salai, Chennai");
            claim6.setAdmissionDate(LocalDate.of(2026, 8, 20));
            claim6.setDischargeDate(LocalDate.of(2026, 8, 20));
            claim6.setServiceDate(LocalDate.of(2026, 8, 20));
            claim6.setClaimAmount(8000.0);
            claim6.setDescription("Root canal treatment");
            claim6.setStatus("Rejected");
            claim6.setRemarks("Exceeds annual dental limit");
            claim6.setSubmissionDate(LocalDate.of(2026, 8, 21));
            claim6.setUser(santhosh);

            List<Claim> claims = claimRepository.saveAll(Arrays.asList(claim1, claim2, claim3, claim4, claim5, claim6));

            // Notifications for Santhosh
            Notification n1 = new Notification();
            n1.setUser(santhosh);
            n1.setMessage("Your claim CLM-2026-001 is under review.");
            n1.setType("CLAIM_UPDATE");
            n1.setRead(false);
            n1.setCreatedAt(LocalDateTime.now().minusMinutes(10));

            Notification n2 = new Notification();
            n2.setUser(santhosh);
            n2.setMessage("Claim CLM-2026-002 has been approved.");
            n2.setType("CLAIM_UPDATE");
            n2.setRead(false);
            n2.setCreatedAt(LocalDateTime.now().minusDays(1));

            Notification n3 = new Notification();
            n3.setUser(santhosh);
            n3.setMessage("Policy POL-10001 expires on 31 Dec 2026.");
            n3.setType("POLICY_EXPIRY");
            n3.setRead(false);
            n3.setCreatedAt(LocalDateTime.now().minusDays(2));

            notificationRepository.saveAll(Arrays.asList(n1, n2, n3));

            System.out.println("--- Demo Data Seeded Successfully ---");
            System.out.println("User: santhosh@email.com / password");
            System.out.println("Admin: admin@example.com / password");
            System.out.println("Policy: Health Secure Plus (POL-10001) ₹5,00,000 / Remaining ₹3,75,000");
            System.out.println("Claims: CLM-2026-001 (Under Review), CLM-2026-002 (Approved), etc.");
        };
    }
}