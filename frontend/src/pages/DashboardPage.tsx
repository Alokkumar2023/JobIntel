import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/authStore';
import {
  Briefcase,
  TrendingUp,
  Bell,
  Settings,
  Bookmark,
  FileText,
  Crown,
  MessageCircle,
  Mail,
  Send,
  Building2,
  MapPin,
  Clock,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
  Calendar,
  Target,
  Zap,
} from 'lucide-react';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Add extra safety check for notificationPreferences
  const notifPrefs = user.notificationPreferences || {
    email: true,
    whatsapp: false,
    telegram: false,
    newJobMatch: true,
    deadlineReminder: true,
    applicationUpdate: true,
    referralUpdate: false,
  };

  // Remove demo/mock data: use backend or empty arrays
  const matchedJobs: any[] = [];
  const recentApplications: any[] = [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'interview':
        return <Badge variant="success">Interview</Badge>;
      case 'in-review':
        return <Badge variant="info">In Review</Badge>;
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'offered':
        return <Badge variant="premium">Offered</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const stats = [
    { label: 'Job Matches', value: matchedJobs.length, icon: Target, color: 'text-primary' },
    { label: 'Applications', value: recentApplications.length, icon: Briefcase, color: 'text-accent' },
    { label: 'Interviews', value: 0, icon: Calendar, color: 'text-success' },
    { label: 'Saved Jobs', value: 0, icon: Bookmark, color: 'text-warning' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your job search today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user.tier !== 'ultra' && (
              <Link to="/pricing">
                <Button variant={user.tier === 'free' ? 'premium' : 'ultra'}>
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade to {user.tier === 'free' ? 'Premium' : 'Ultra'}
                </Button>
              </Link>
            )}
            <Badge variant={user.tier === 'ultra' ? 'ultra' : user.tier === 'premium' ? 'premium' : 'free'} className="py-1.5">
              {user.tier.charAt(0).toUpperCase() + user.tier.slice(1)}
            </Badge>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-5 border border-border shadow-soft animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
                <span className="text-3xl font-bold">{stat.value}</span>
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Completion */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Profile Completion</h2>
                <Link to="/settings">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </div>
              <Progress value={user.profileCompletion || 0} className="h-2 mb-3" />
              <p className="text-sm text-muted-foreground">
                Your profile is {user.profileCompletion || 0}% complete. Add more skills to improve job matching.
              </p>
            </div>

            {/* Top Job Matches */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Top Job Matches
                </h2>
                <Link to="/jobs">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {matchedJobs.slice(0, 3).map((job, index) => (
                  <div
                    key={job.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="h-12 w-12 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link to={`/jobs/${job.id}`}>
                            <h3 className="font-medium hover:text-primary transition-colors line-clamp-1">
                              {job.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">{job.company.name}</p>
                        </div>
                        <Badge variant="success" className="flex-shrink-0">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          {job.matchScore}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(job.postedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                      <Button variant="accent" size="sm">
                        Apply
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Applications
                </h2>
                <Link to="/applications">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-4">
                {recentApplications.map((app, index) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-1">{app.job.title}</h3>
                      <p className="text-sm text-muted-foreground">{app.job.company.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(app.status)}
                      {app.autoApplied && (
                        <Badge variant="secondary" className="gap-1">
                          <Zap className="h-3 w-3" />
                          Auto
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notification Preferences */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Channels
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                  </div>
                  <Switch
                    id="whatsapp"
                    checked={notifPrefs.whatsapp}
                    disabled={user.tier === 'free'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <Label htmlFor="email">Email</Label>
                  </div>
                  <Switch
                    id="email"
                    checked={notifPrefs.email}
                    disabled={user.tier === 'free'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-sky-500/10 flex items-center justify-center">
                      <Send className="h-4 w-4 text-sky-600" />
                    </div>
                    <Label htmlFor="telegram">Telegram</Label>
                  </div>
                  <Switch
                    id="telegram"
                    checked={notifPrefs.telegram}
                    disabled={user.tier === 'free'}
                  />
                </div>
                {user.tier === 'free' && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Upgrade to Premium to enable notifications.
                  </p>
                )}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="font-semibold mb-4">Your Skills</h2>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="mt-4 w-full">
                + Add More Skills
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <h2 className="font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <Link to="/jobs">
                  <Button variant="outline" className="w-full justify-start">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Resume
                </Button>
                <Link to="/settings">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>

            {/* Upgrade CTA */}
            {user.tier !== 'ultra' && (
              <div className="gradient-hero rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">
                  {user.tier === 'free' ? 'Unlock Premium Features' : 'Go Ultra Premium'}
                </h3>
                <p className="text-sm text-white/80 mb-4">
                  {user.tier === 'free'
                    ? 'Get AI matching, instant notifications, and early job access.'
                    : 'Enable auto-apply, AI cover letters, and priority support.'}
                </p>
                <Link to="/pricing">
                  <Button variant="heroOutline" className="w-full">
                    Upgrade Now
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
