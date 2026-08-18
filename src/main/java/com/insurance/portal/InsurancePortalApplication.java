package com.insurance.portal;

import com.insurance.portal.model.Claim;
import com.insurance.portal.model.Policy;
import com.insurance.portal.model.User;
import com.insurance.portal.repository.ClaimRepository;
import com.insurance.portal.repository.PolicyRepository;
import com.insurance.portal.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;
import java.util.Arrays;

@SpringBootApplication
public class InsurancePortalApplication {

	public static void main(String[] args) {
		SpringApplication.run(InsurancePortalApplication.class, args);
	}

	@Bean
	public CommandLineRunner demoData(UserRepository userRepository, PolicyRepository policyRepository, ClaimRepository claimRepository) {
		return args -> {
			// Create Demo Users
			User john = new User();
			john.setEmail("user@example.com");
			john.setPassword("password"); // In a real app we would hash passwords
			john.setFullName("John Doe");
			john.setRole("USER");

			User admin = new User();
			admin.setEmail("admin@example.com");
			admin.setPassword("password");
			admin.setFullName("Admin Reviewer");
			admin.setRole("ADMIN");

			userRepository.saveAll(Arrays.asList(john, admin));

			// Create Demo Policies for John Doe
			Policy healthPolicy = new Policy();
			healthPolicy.setPolicyNumber("POL-98765-A");
			healthPolicy.setPolicyName("Premium Health Shield");
			healthPolicy.setPolicyType("Health");
			healthPolicy.setCoverageLimit(50000.0);
			healthPolicy.setRemainingBalance(42500.0);
			healthPolicy.setDeductible(1500.0);
			healthPolicy.setPremiumAmount(280.0);
			healthPolicy.setStatus("Active");
			healthPolicy.setUser(john);

			Policy dentalPolicy = new Policy();
			dentalPolicy.setPolicyNumber("POL-43210-B");
			dentalPolicy.setPolicyName("Dental & Vision Extra");
			dentalPolicy.setPolicyType("Dental/Vision");
			dentalPolicy.setCoverageLimit(5000.0);
			dentalPolicy.setRemainingBalance(4850.0);
			dentalPolicy.setDeductible(100.0);
			dentalPolicy.setPremiumAmount(45.0);
			dentalPolicy.setStatus("Active");
			dentalPolicy.setUser(john);

			policyRepository.saveAll(Arrays.asList(healthPolicy, dentalPolicy));

			// Create Demo Claims
			Claim claim1 = new Claim();
			claim1.setPolicyNumber("POL-98765-A");
			claim1.setServiceDate(LocalDate.now().minusDays(20));
			claim1.setClaimAmount(3200.0);
			claim1.setProvider("City General Hospital");
			claim1.setDescription("Emergency Appendectomy");
			claim1.setStatus("Approved");
			claim1.setRemarks("Approved based on policy coverage of emergency surgery.");
			claim1.setSubmissionDate(LocalDate.now().minusDays(19));
			claim1.setUser(john);

			Claim claim2 = new Claim();
			claim2.setPolicyNumber("POL-98765-A");
			claim2.setServiceDate(LocalDate.now().minusDays(10));
			claim2.setClaimAmount(4300.0);
			claim2.setProvider("Metropolitan Dental Care");
			claim2.setDescription("Wisdom teeth extraction and filling");
			claim2.setStatus("Under Review");
			claim2.setRemarks("");
			claim2.setSubmissionDate(LocalDate.now().minusDays(9));
			claim2.setUser(john);

			Claim claim3 = new Claim();
			claim3.setPolicyNumber("POL-43210-B");
			claim3.setServiceDate(LocalDate.now().minusDays(3));
			claim3.setClaimAmount(150.0);
			claim3.setProvider("ClearVision Opticals");
			claim3.setDescription("Prescription Reading Glasses");
			claim3.setStatus("Pending");
			claim3.setRemarks("");
			claim3.setSubmissionDate(LocalDate.now().minusDays(2));
			claim3.setUser(john);

			claimRepository.saveAll(Arrays.asList(claim1, claim2, claim3));

			System.out.println("--- Demo Data Seeded Successfully ---");
		};
	}
}
