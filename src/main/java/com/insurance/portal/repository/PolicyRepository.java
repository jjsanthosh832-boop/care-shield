package com.insurance.portal.repository;

import com.insurance.portal.model.Policy;
import com.insurance.portal.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByUser(User user);
    Optional<Policy> findByPolicyNumber(String policyNumber);
}
