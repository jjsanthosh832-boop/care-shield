import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePolicies, usePurchasePolicy } from '../hooks/useApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatINR } from '../utils/currency';
import { Shield, HeartPulse, Baby, Car, CheckCircle2 } from 'lucide-react';
import { PageSpinner } from '../components/ui/Spinner';

const CATALOG = [
  { name: 'Premium Health Shield', type: 'Health', icon: HeartPulse, color: 'text-red-500 bg-red-100', limit: 500000, deductible: 15000, premium: 2800, desc: 'Comprehensive medical protection including inpatient/outpatient services, surgery and specialist coverage.' },
  { name: 'Family Care Plus', type: 'Health', icon: HeartPulse, color: 'text-blue-500 bg-blue-100', limit: 1000000, deductible: 25000, premium: 5500, desc: 'Complete family coverage with maternity benefits, pediatric care, and wellness programs.' },
  { name: 'Dental & Vision Extra', type: 'Dental/Vision', icon: Baby, color: 'text-purple-500 bg-purple-100', limit: 50000, deductible: 5000, premium: 800, desc: 'Covers annual dental checkups, cleaning, fillings, root canals, and prescription eyewear/lenses.' },
  { name: 'Senior Citizen Secure', type: 'Health', icon: Shield, color: 'text-green-500 bg-green-100', limit: 300000, deductible: 10000, premium: 3200, desc: 'Specially designed for ages 60+ with pre-existing condition coverage after 2 years.' },
  { name: 'Critical Illness Guard', type: 'Health', icon: Shield, color: 'text-orange-500 bg-orange-100', limit: 2000000, deductible: 0, premium: 1800, desc: 'Lump sum payout on diagnosis of 30+ critical illnesses including cancer, heart attack, stroke.' },
  { name: 'Personal Accident Cover', type: 'Accident', icon: Car, color: 'text-indigo-500 bg-indigo-100', limit: 1000000, deductible: 0, premium: 1200, desc: 'Worldwide coverage for accidental death, permanent disability, and medical expenses.' },
];

export function ExplorePoliciesPage() {
  const { user } = useAuth();
  const { data: userPolicies, isLoading: policiesLoading } = usePolicies(user?.id);
  const purchasePolicy = usePurchasePolicy();
  const [enrolling, setEnrolling] = useState(null);

  if (policiesLoading) {
    return <PageSpinner />;
  }

  const enrolledNames = new Set((userPolicies || []).map(p => p.policyName));

  const handleEnroll = async (policy) => {
    setEnrolling(policy.name);
    try {
      await purchasePolicy.mutateAsync({
        userId: user.id,
        policyName: policy.name,
        policyType: policy.type,
        coverageLimit: policy.limit,
        deductible: policy.deductible,
        premiumAmount: policy.premium,
      });
    } finally {
      setEnrolling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Explore Policies</h1>
        <p className="text-slate-500 mt-1">Choose from our comprehensive insurance plans tailored for your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATALOG.map((policy) => {
          const isEnrolled = enrolledNames.has(policy.name);
          const Icon = policy.icon;

          return (
            <Card key={policy.name} className="flex flex-col h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${policy.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <Badge variant="primary" className="text-xs">{policy.type}</Badge>
                    </div>
                    <CardTitle className="text-lg">{policy.name}</CardTitle>
                  </div>
                  {isEnrolled && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  )}
                </div>
                <CardDescription>{policy.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Coverage Limit</span>
                    <span className="font-semibold">{formatINR(policy.limit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deductible</span>
                    <span className="font-semibold">{formatINR(policy.deductible)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Premium</span>
                    <span className="font-semibold">{formatINR(policy.premium)}/mo</span>
                  </div>
                </div>
                <Button
                  className="mt-auto"
                  variant={isEnrolled ? 'secondary' : 'primary'}
                  onClick={() => handleEnroll(policy)}
                  disabled={isEnrolled || enrolling === policy.name}
                  loading={enrolling === policy.name}
                >
                  {isEnrolled ? 'Enrolled' : 'Enroll Now'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}