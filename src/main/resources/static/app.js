// App State Management
let currentUser = null;
let userPolicies = [];
let allClaims = [];
const API_BASE = '/api';

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkExistingSession();
    updateCurrentDate();
});

function updateCurrentDate() {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = new Date().toLocaleDateString('en-US', options);
}

// Session Check
function checkExistingSession() {
    const savedUser = localStorage.getItem('care_shield_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showApp();
    } else {
        showLogin();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Login form submit
    document.getElementById('login-form').addEventListener('submit', handleLogin);

    // Auth toggles
    document.getElementById('toggle-to-register').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
        document.getElementById('toggle-to-register').classList.add('hidden');
        document.getElementById('toggle-to-login').classList.remove('hidden');
    });

    document.getElementById('toggle-to-login').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.remove('hidden');
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('toggle-to-register').classList.remove('hidden');
        document.getElementById('toggle-to-login').classList.add('hidden');
    });

    // Register form submit
    document.getElementById('register-form').addEventListener('submit', handleRegister);

    // Profile settings form submit
    document.getElementById('profile-settings-form').addEventListener('submit', handleProfileUpdate);

    // Sidebar navigation clicks
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Claim form submit
    document.getElementById('claim-submission-form').addEventListener('submit', handleClaimSubmission);

    // Claim review form submit (Admin)
    document.getElementById('claim-review-form').addEventListener('submit', handleClaimReviewSubmit);

    // Logout
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Filter controls for claims table
    document.getElementById('claims-search-input').addEventListener('input', filterUserClaimsTable);
    document.getElementById('claims-status-filter').addEventListener('change', filterUserClaimsTable);
}

// Switch UI screen
function showLogin() {
    document.getElementById('login-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showApp() {
    document.getElementById('login-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');

    // Update profile metadata
    document.getElementById('user-display-name').innerText = currentUser.fullName;
    document.getElementById('user-display-role').innerText = currentUser.role;
    document.getElementById('current-tab-subtitle').innerText = `Welcome back, ${currentUser.fullName.split(' ')[0]}!`;

    // Reset view based on Role
    const userNav = document.getElementById('user-nav-links');
    const adminNav = document.getElementById('admin-nav-links');

    if (currentUser.role === 'ADMIN') {
        userNav.classList.add('hidden');
        adminNav.classList.remove('hidden');
        switchTab('admin-dashboard');
    } else {
        userNav.classList.remove('hidden');
        adminNav.classList.add('hidden');
        switchTab('dashboard');
    }
}

// Tab Switching Navigation
function switchTab(tabId) {
    // Update Sidebar Active state
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('data-tab') === tabId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Show Pane
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => {
        if (pane.id === `tab-${tabId}`) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });

    // Set Header Title
    let title = "Dashboard Overview";
    if (tabId === 'explore-policies') title = "Explore Insurance Policies";
    if (tabId === 'submit-claim') title = "File a New Claim";
    if (tabId === 'my-claims') title = "Track Submitted Claims";
    if (tabId === 'profile-settings') title = "Profile Settings";
    if (tabId === 'admin-dashboard') title = "Review Claims Queue";

    document.getElementById('current-tab-title').innerText = title;

    // Load Data dynamically depending on the active tab
    if (tabId === 'dashboard') {
        loadDashboardData();
    } else if (tabId === 'explore-policies') {
        loadPolicyCatalog();
    } else if (tabId === 'submit-claim') {
        loadClaimFormPolicies();
    } else if (tabId === 'my-claims') {
        loadUserClaims();
    } else if (tabId === 'profile-settings') {
        loadProfileData();
    } else if (tabId === 'admin-dashboard') {
        loadAdminClaimsQueue();
    }
}

// Credentials Helper fill-in
window.fillCredentials = function(email, password) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = password;
};

// Handle Login API
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = document.getElementById('login-submit-btn');

    submitBtn.disabled = true;
    submitBtn.innerText = 'Signing in...';

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            currentUser = await response.json();
            localStorage.setItem('care_shield_user', JSON.stringify(currentUser));
            showToast('Successfully logged in!', 'success');
            showApp();
        } else {
            const errData = await response.json();
            showToast(errData.message || 'Login failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Network error connecting to backend server.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Sign In</span> <i class="fa-solid fa-arrow-right-to-bracket"></i>';
    }
}

// Load Dashboard Data (Policies & Recent Claims)
async function loadDashboardData() {
    try {
        // Fetch Policies
        const polRes = await fetch(`${API_BASE}/policies?userId=${currentUser.id}`);
        if (polRes.ok) {
            userPolicies = await polRes.json();
            renderPolicies(userPolicies);
            document.getElementById('stat-active-policies').innerText = userPolicies.length;
        }

        // Fetch Claims for summary stats
        const claimRes = await fetch(`${API_BASE}/claims?userId=${currentUser.id}`);
        if (claimRes.ok) {
            allClaims = await claimRes.json();
            
            // Calculate Approved Total & Pending Count
            let totalReimbursements = 0;
            let pendingCount = 0;
            allClaims.forEach(claim => {
                if (claim.status === 'Approved') {
                    totalReimbursements += claim.claimAmount;
                } else if (claim.status === 'Pending' || claim.status === 'Under Review') {
                    pendingCount++;
                }
            });

            document.getElementById('stat-approved-amount').innerText = `$${totalReimbursements.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            document.getElementById('stat-pending-claims').innerText = pendingCount;

            // Render top 3 recent claims in dashboard table
            renderRecentClaimsTable(allClaims.slice(0, 3));
        }
    } catch (error) {
        console.error(error);
        showToast('Failed to load dashboard statistics.', 'error');
    }
}

// Render Policy Cards on User Dashboard
function renderPolicies(policies) {
    const container = document.getElementById('policies-container');
    container.innerHTML = '';

    if (policies.length === 0) {
        container.innerHTML = `<div class="text-center col-span-2 text-muted">No active policies found for your account.</div>`;
        return;
    }

    policies.forEach(policy => {
        const remainingPercentage = (policy.remainingBalance / policy.coverageLimit) * 100;
        const card = document.createElement('div');
        card.className = 'policy-card';
        card.innerHTML = `
            <div class="policy-card-header">
                <div class="policy-name-wrapper">
                    <h4>${policy.policyName}</h4>
                    <span class="policy-type">${policy.policyType} Coverage</span>
                </div>
                <span class="badge ${policy.status === 'Active' ? 'badge-green' : 'badge-red'}">${policy.status}</span>
            </div>
            <div class="policy-balance">
                <div class="policy-balance-label">Remaining Balance</div>
                <div class="policy-balance-value">$${policy.remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
            </div>
            <div class="policy-progress-wrapper">
                <div class="policy-progress-bar-bg">
                    <div class="policy-progress-bar-fill" style="width: ${remainingPercentage}%"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary)">
                    <span>$${policy.remainingBalance.toLocaleString()} Left</span>
                    <span>Limit: $${policy.coverageLimit.toLocaleString()}</span>
                </div>
            </div>
            <div class="policy-meta-grid">
                <span>Deductible: <strong>$${policy.deductible}</strong></span>
                <span>Premium: <strong>$${policy.premiumAmount}/mo</strong></span>
                <span class="col-span-2">Policy No: <strong>${policy.policyNumber}</strong></span>
            </div>
        `;
        container.appendChild(card);
    });
}

// Render Recent Claims Table rows
function renderRecentClaimsTable(claims) {
    const tbody = document.getElementById('recent-claims-table-body');
    tbody.innerHTML = '';

    if (claims.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No claims filed yet.</td></tr>`;
        return;
    }

    claims.forEach(claim => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${claim.id}</td>
            <td><strong>${claim.policyNumber}</strong></td>
            <td>${claim.provider}</td>
            <td>${claim.serviceDate}</td>
            <td><strong>$${claim.claimAmount.toFixed(2)}</strong></td>
            <td><span class="badge ${getStatusBadgeClass(claim.status)}">${claim.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

// Load Policies into Claim Form Dropdown
async function loadClaimFormPolicies() {
    try {
        const polRes = await fetch(`${API_BASE}/policies?userId=${currentUser.id}`);
        if (polRes.ok) {
            const policies = await polRes.json();
            const select = document.getElementById('claim-policy-select');
            select.innerHTML = '<option value="" disabled selected>Select a policy</option>';
            
            policies.forEach(policy => {
                const opt = document.createElement('option');
                opt.value = policy.policyNumber;
                opt.text = `${policy.policyName} (${policy.policyNumber}) - Balance: $${policy.remainingBalance}`;
                select.appendChild(opt);
            });
        }
    } catch (e) {
        console.error(e);
    }
}

// Handle Claim Form Submission (multipart/form-data)
async function handleClaimSubmission(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submit-claim-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting Claim...';

    const formData = new FormData();
    formData.append('userId', currentUser.id);
    formData.append('policyNumber', document.getElementById('claim-policy-select').value);
    formData.append('provider', document.getElementById('claim-provider').value);
    formData.append('serviceDate', document.getElementById('claim-service-date').value);
    formData.append('claimAmount', parseFloat(document.getElementById('claim-amount').value));
    formData.append('description', document.getElementById('claim-description').value);

    const fileInput = document.getElementById('claim-file');
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    try {
        const response = await fetch(`${API_BASE}/claims`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            showToast('Claim submitted successfully!', 'success');
            document.getElementById('claim-submission-form').reset();
            switchTab('my-claims');
        } else {
            const errorText = await response.text();
            showToast(errorText || 'Failed to submit claim.', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Network error occurred.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Submit Claim</span> <i class="fa-solid fa-paper-plane"></i>';
    }
}

// Load Claims List for Track Claims Pane
async function loadUserClaims() {
    try {
        const res = await fetch(`${API_BASE}/claims?userId=${currentUser.id}`);
        if (res.ok) {
            allClaims = await res.json();
            renderUserClaimsTable(allClaims);
        }
    } catch (err) {
        console.error(err);
        showToast('Failed to load claims list.', 'error');
    }
}

// Render User Claims Table with Filters
function renderUserClaimsTable(claims) {
    const tbody = document.getElementById('my-claims-table-body');
    tbody.innerHTML = '';

    if (claims.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No claims match the filter criteria.</td></tr>`;
        return;
    }

    claims.forEach(claim => {
        const tr = document.createElement('tr');
        const viewDocBtn = claim.fileName 
            ? `<button class="btn btn-outline btn-sm" onclick="viewDocument(${claim.id})"><i class="fa-solid fa-paperclip"></i> View</button>` 
            : `<span class="text-muted">None</span>`;

        tr.innerHTML = `
            <td>#${claim.id}</td>
            <td><strong>${claim.policyNumber}</strong></td>
            <td>${claim.provider}</td>
            <td>${claim.serviceDate}</td>
            <td><strong>$${claim.claimAmount.toFixed(2)}</strong></td>
            <td>${claim.submissionDate}</td>
            <td>
                <span class="badge ${getStatusBadgeClass(claim.status)}">${claim.status}</span>
                ${claim.remarks ? `<br><small class="text-muted" style="display:block; margin-top:2px;">"${claim.remarks}"</small>` : ''}
            </td>
            <td>${viewDocBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Filter user claims list locally based on inputs
function filterUserClaimsTable() {
    const searchQuery = document.getElementById('claims-search-input').value.toLowerCase();
    const statusFilter = document.getElementById('claims-status-filter').value;

    const filtered = allClaims.filter(claim => {
        const matchesSearch = 
            claim.provider.toLowerCase().includes(searchQuery) ||
            claim.description.toLowerCase().includes(searchQuery) ||
            claim.id.toString().includes(searchQuery);

        const matchesStatus = statusFilter === 'ALL' || claim.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    renderUserClaimsTable(filtered);
}

// ADMIN FUNCTIONALITY: Load Admin Pending Claims
async function loadAdminClaimsQueue() {
    try {
        const res = await fetch(`${API_BASE}/claims?userId=${currentUser.id}`);
        if (res.ok) {
            const claims = await res.json();
            
            // Calculate stats
            let pendingCount = 0;
            let processedCount = 0;
            let outflow = 0;
            
            claims.forEach(claim => {
                if (claim.status === 'Pending' || claim.status === 'Under Review') {
                    pendingCount++;
                } else {
                    processedCount++;
                    if (claim.status === 'Approved') {
                        outflow += claim.claimAmount;
                    }
                }
            });

            document.getElementById('admin-stat-pending').innerText = pendingCount;
            document.getElementById('admin-stat-processed').innerText = processedCount;
            document.getElementById('admin-stat-outflow').innerText = `$${outflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

            // Render table
            const tbody = document.getElementById('admin-claims-table-body');
            tbody.innerHTML = '';

            if (claims.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No claims in the system.</td></tr>`;
                return;
            }

            claims.forEach(claim => {
                const docBtn = claim.fileName 
                    ? `<button class="btn btn-outline btn-sm" onclick="viewDocument(${claim.id})"><i class="fa-solid fa-paperclip"></i> View Receipt</button>` 
                    : `<span class="text-muted">No Receipt</span>`;

                const actionCell = (claim.status === 'Pending' || claim.status === 'Under Review')
                    ? `<button class="btn btn-primary btn-sm" onclick="openReviewModal(${JSON.stringify(claim).replace(/"/g, '&quot;')})">Review</button>`
                    : `<span class="badge ${getStatusBadgeClass(claim.status)}">${claim.status}</span>`;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>#${claim.id}</td>
                    <td><strong>${claim.policyNumber}</strong></td>
                    <td>${claim.user.fullName}</td>
                    <td>${claim.provider}</td>
                    <td>${claim.serviceDate}</td>
                    <td><strong>$${claim.claimAmount.toFixed(2)}</strong></td>
                    <td>${claim.submissionDate}</td>
                    <td>${docBtn}</td>
                    <td>${actionCell}</td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (e) {
        console.error(e);
        showToast('Failed to load admin claims queue.', 'error');
    }
}

// ADMIN FUNCTIONALITY: Open/Close Review Modals
window.openReviewModal = function(claim) {
    // If claim is Pending, let's mark it as Under Review in the database so other admins know it is being processed
    if (claim.status === 'Pending') {
        updateClaimStatusSilently(claim.id, 'Under Review');
    }

    document.getElementById('review-claim-id').innerText = claim.id;
    document.getElementById('review-user-name').innerText = claim.user ? claim.user.fullName : 'N/A';
    document.getElementById('review-policy-number').innerText = claim.policyNumber;
    document.getElementById('review-provider').innerText = claim.provider;
    document.getElementById('review-service-date').innerText = claim.serviceDate;
    document.getElementById('review-claim-amount').innerText = `$${claim.claimAmount.toFixed(2)}`;
    document.getElementById('review-description').innerText = claim.description;

    document.getElementById('review-remarks').value = '';
    document.getElementById('review-modal').classList.remove('hidden');
};

window.closeReviewModal = function() {
    document.getElementById('review-modal').classList.add('hidden');
    loadAdminClaimsQueue(); // Refresh queue
};

async function updateClaimStatusSilently(id, status) {
    try {
        await fetch(`${API_BASE}/claims/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, remarks: 'Assigned for active review' })
        });
    } catch (e) {
        console.error(e);
    }
}

// ADMIN FUNCTIONALITY: Submit Decision
async function handleClaimReviewSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('review-claim-id').innerText;
    const status = document.getElementById('review-status').value;
    const remarks = document.getElementById('review-remarks').value;

    try {
        const response = await fetch(`${API_BASE}/claims/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, remarks })
        });

        if (response.ok) {
            showToast(`Claim #${id} successfully ${status.toLowerCase()}!`, 'success');
            closeReviewModal();
        } else {
            const errText = await response.text();
            showToast(errText || 'Failed to update claim status.', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Error sending review submission to server.', 'error');
    }
}

// Document Viewing function
window.viewDocument = async function(claimId) {
    try {
        const res = await fetch(`${API_BASE}/claims/${claimId}/document`);
        if (res.ok) {
            const fileData = await res.json();
            const modalContent = document.getElementById('document-modal-content');
            modalContent.innerHTML = '';

            const isImage = fileData.fileType.startsWith('image/');
            if (isImage) {
                modalContent.innerHTML = `<img src="data:${fileData.fileType};base64,${fileData.documentBase64}" alt="Receipt" style="max-width: 100%; max-height: 500px; border-radius: 12px; border: 1px solid var(--border);">`;
            } else {
                // PDF fallback
                modalContent.innerHTML = `
                    <div style="padding: 3rem; background: var(--bg-tertiary); border-radius: 12px;">
                        <i class="fa-regular fa-file-pdf" style="font-size: 4rem; color: var(--danger); margin-bottom: 1rem;"></i>
                        <h4>${fileData.fileName}</h4>
                        <p class="text-secondary" style="font-size: 0.85rem; margin-bottom: 1.5rem;">PDF Document (Base64 Encoded)</p>
                        <a href="data:${fileData.fileType};base64,${fileData.documentBase64}" download="${fileData.fileName}" class="btn btn-primary">
                            <i class="fa-solid fa-download"></i> Download PDF Document
                        </a>
                    </div>
                `;
            }

            document.getElementById('document-modal').classList.remove('hidden');
        } else {
            showToast('Document not found or could not be loaded.', 'error');
        }
    } catch (e) {
        console.error(e);
        showToast('Error loading attachment.', 'error');
    }
};

window.closeDocumentModal = function() {
    document.getElementById('document-modal').classList.add('hidden');
};

// Logout handler
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('care_shield_user');
    showToast('Successfully logged out.', 'info');
    showLogin();
}

// Helper badge colors
function getStatusBadgeClass(status) {
    if (status === 'Approved') return 'badge-green';
    if (status === 'Pending') return 'badge-orange';
    if (status === 'Under Review') return 'badge-blue';
    if (status === 'Rejected') return 'badge-red';
    return 'badge-blue';
}

// Toast alerts helper
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.className = 'toast show';
    
    let icon = '<i class="fa-solid fa-circle-info" style="color: var(--info)"></i>';
    if (type === 'success') {
        icon = '<i class="fa-solid fa-circle-check" style="color: var(--success)"></i>';
    } else if (type === 'error') {
        icon = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--danger)"></i>';
    }

    toast.innerHTML = `${icon} <span>${message}</span>`;
    
    setTimeout(() => {
        toast.className = 'toast hidden';
    }, 4000);
}

// User Registration API Handler
async function handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const role = document.getElementById('register-role').value;
    const submitBtn = document.getElementById('register-submit-btn');

    submitBtn.disabled = true;
    submitBtn.innerText = 'Creating account...';

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password, role })
        });

        if (response.ok) {
            showToast('Account created successfully! Please sign in.', 'success');
            document.getElementById('register-form').reset();
            // Switch back to Login view
            document.getElementById('toggle-to-login').click();
        } else {
            const errData = await response.json();
            showToast(errData.message || 'Registration failed. Try again.', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Network error while registering.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Create Account</span> <i class="fa-solid fa-user-plus"></i>';
    }
}

// Policy Catalog Policies
const POLICY_CATALOG = [
    { name: 'Premium Health Shield', type: 'Health', limit: 50000.0, deductible: 1500.0, premium: 280.0, desc: 'Comprehensive medical protection including inpatient/outpatient services, surgery and specialist coverage.' },
    { name: 'Dental & Vision Extra', type: 'Dental/Vision', limit: 500.0, deductible: 100.0, premium: 45.0, desc: 'Covers annual dental checkups, cleaning, fillings, and prescription eyewear/lenses.' },
    { name: 'Standard Life Protect', type: 'Life', limit: 100000.0, deductible: 0.0, premium: 120.0, desc: 'Affordable term life insurance policies ensuring complete financial safety for your family.' },
    { name: 'Essential Auto Coverage', type: 'Auto', limit: 25000.0, deductible: 500.0, premium: 95.0, desc: 'Reliable comprehensive auto coverage covering third-party liability and collision damage.' }
];

// Load and render Policy Catalog
async function loadPolicyCatalog() {
    try {
        // Fetch current active policies to see what user has already enrolled in
        const polRes = await fetch(`${API_BASE}/policies?userId=${currentUser.id}`);
        let enrolledNumbers = [];
        if (polRes.ok) {
            userPolicies = await polRes.json();
            enrolledNumbers = userPolicies.map(p => p.policyName);
        }

        const container = document.getElementById('policy-catalog-container');
        container.innerHTML = '';

        POLICY_CATALOG.forEach(catalogItem => {
            const isEnrolled = enrolledNumbers.includes(catalogItem.name);
            const card = document.createElement('div');
            card.className = 'catalog-card';
            card.innerHTML = `
                <div class="catalog-card-header">
                    <h4>${catalogItem.name}</h4>
                    <span class="catalog-type">${catalogItem.type} Plan</span>
                </div>
                <p class="catalog-desc">${catalogItem.desc}</p>
                <div class="catalog-details">
                    <div>Limit: <strong>$${catalogItem.limit.toLocaleString()}</strong></div>
                    <div>Deductible: <strong>$${catalogItem.deductible}</strong></div>
                    <div>Premium: <strong>$${catalogItem.premium}/mo</strong></div>
                </div>
                <button class="btn btn-block ${isEnrolled ? 'btn-outline' : 'btn-primary'}" 
                    ${isEnrolled ? 'disabled' : ''} 
                    onclick="enrollInPolicy('${catalogItem.name}')">
                    ${isEnrolled ? '<i class="fa-solid fa-circle-check"></i> Enrolled' : 'Enroll Now'}
                </button>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        showToast('Failed to load policy catalog.', 'error');
    }
}

// Enroll / Purchase Policy
window.enrollInPolicy = async function(policyName) {
    const catalogItem = POLICY_CATALOG.find(p => p.name === policyName);
    if (!catalogItem) return;

    try {
        const response = await fetch(`${API_BASE}/policies/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUser.id,
                policyName: catalogItem.name,
                policyType: catalogItem.type,
                coverageLimit: catalogItem.limit,
                deductible: catalogItem.deductible,
                premiumAmount: catalogItem.premium
            })
        });

        if (response.ok) {
            showToast(`Successfully enrolled in ${policyName}!`, 'success');
            loadPolicyCatalog(); // Refresh catalog view
        } else {
            showToast('Enrollment failed. Try again.', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Network error during enrollment.', 'error');
    }
};

// Load Profile Data into Form fields
function loadProfileData() {
    document.getElementById('profile-email').value = currentUser.email;
    document.getElementById('profile-name').value = currentUser.fullName;
    document.getElementById('profile-password').value = '';
}

// Handle Profile Updates
async function handleProfileUpdate(e) {
    e.preventDefault();
    const fullName = document.getElementById('profile-name').value;
    const password = document.getElementById('profile-password').value;
    const saveBtn = document.getElementById('save-profile-btn');

    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving changes...';

    const payload = {};
    if (fullName) payload.fullName = fullName;
    if (password) payload.password = password;

    try {
        const response = await fetch(`${API_BASE}/users/${currentUser.id}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            currentUser = await response.json();
            localStorage.setItem('care_shield_user', JSON.stringify(currentUser));
            
            // Refresh visual items
            document.getElementById('user-display-name').innerText = currentUser.fullName;
            showToast('Profile updated successfully!', 'success');
            loadProfileData();
        } else {
            showToast('Failed to update profile.', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Network error updating profile.', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<span>Save Changes</span> <i class="fa-solid fa-floppy-disk"></i>';
    }
}
