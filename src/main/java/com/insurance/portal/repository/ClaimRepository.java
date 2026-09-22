package com.insurance.portal.repository;

import com.insurance.portal.model.Claim;
import com.insurance.portal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByUser(User user);
    List<Claim> findByOrderBySubmissionDateDesc();
    Optional<Claim> findByClaimNumber(String claimNumber);
    long countBySubmissionDateBetween(LocalDate start, LocalDate end);
    List<Claim> findByPolicyNumber(String policyNumber);
}