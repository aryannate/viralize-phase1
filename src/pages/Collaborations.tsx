
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import Sidebar from "@/components/dashboard/Sidebar";
import { Handshake, Search, Check, X, Plus, MessageSquare } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Collaboration = {
  id: string;
  brand_name: string;
  brand_description: string;
  collaboration_type: string;
  requirements: string;
  compensation: string;
  is_active: boolean;
  created_at: string;
};

type Application = {
  id: string;
  collaboration_id: string;
  user_id: string;
  message: string;
  status: string;
  created_at: string;
  // Join fields
  brand_name?: string;
};

const Collaborations = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [filteredCollaborations, setFilteredCollaborations] = useState<Collaboration[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // New collaboration form state
  const [newCollaboration, setNewCollaboration] = useState({
    brand_name: "",
    brand_description: "",
    collaboration_type: "sponsored_post",
    requirements: "",
    compensation: ""
  });
  
  // Application form state
  const [applicationMessage, setApplicationMessage] = useState("");
  const [applyingToId, setApplyingToId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollaborations = async () => {
      try {
        const { data, error } = await supabase
          .from('brand_collaborations')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setCollaborations(data || []);
        setFilteredCollaborations(data || []);
      } catch (error: any) {
        console.error("Error fetching collaborations:", error);
        toast({
          title: "Error",
          description: "Failed to load collaborations",
          variant: "destructive",
        });
      }
    };
    
    const fetchApplications = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('collaboration_applications')
          .select(`
            *,
            brand_collaborations(brand_name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const formattedApplications = data?.map(app => ({
          ...app,
          brand_name: app.brand_collaborations?.brand_name
        })) || [];
        
        setApplications(formattedApplications);
      } catch (error: any) {
        console.error("Error fetching applications:", error);
      }
    };
    
    Promise.all([fetchCollaborations(), fetchApplications()])
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    // Filter collaborations based on search query
    if (searchQuery.trim() === '') {
      setFilteredCollaborations(collaborations);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = collaborations.filter(collab => 
        collab.brand_name.toLowerCase().includes(query) || 
        collab.brand_description.toLowerCase().includes(query) ||
        collab.collaboration_type.toLowerCase().includes(query)
      );
      setFilteredCollaborations(filtered);
    }
  }, [searchQuery, collaborations]);

  const handleCreateCollaboration = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_collaborations')
        .insert({
          ...newCollaboration,
          is_active: true
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Collaboration created",
        description: "Your brand collaboration has been published",
      });
      
      setShowCreateDialog(false);
      setCollaborations([...(data || []), ...collaborations]);
      setFilteredCollaborations([...(data || []), ...filteredCollaborations]);
      
      // Reset form
      setNewCollaboration({
        brand_name: "",
        brand_description: "",
        collaboration_type: "sponsored_post",
        requirements: "",
        compensation: ""
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create collaboration",
        variant: "destructive",
      });
    }
  };
  
  const handleApply = async (collaborationId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to apply for collaborations",
        variant: "destructive",
      });
      return;
    }
    
    if (!applicationMessage.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message to the brand",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('collaboration_applications')
        .insert({
          collaboration_id: collaborationId,
          user_id: user.id,
          message: applicationMessage,
          status: 'pending'
        })
        .select(`
          *,
          brand_collaborations(brand_name)
        `);
        
      if (error) throw error;
      
      toast({
        title: "Application submitted",
        description: "Your application has been submitted to the brand",
      });
      
      // Add to applications list
      const newApplication = {
        ...data[0],
        brand_name: data[0].brand_collaborations?.brand_name
      };
      
      setApplications([newApplication, ...applications]);
      setApplyingToId(null);
      setApplicationMessage("");
    } catch (error: any) {
      console.error("Error applying:", error);
      toast({
        title: "Application failed",
        description: error.message || "Failed to submit your application",
        variant: "destructive",
      });
    }
  };
  
  const formatCollaborationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar activeTab="collaborations" setActiveTab={() => {}} />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Collaboration Hub</h1>
              <p className="text-muted-foreground mt-2">
                Connect with brands for partnerships and sponsorship opportunities
              </p>
            </div>
            
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Opportunity
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-8 w-[400px]">
              <TabsTrigger value="browse" className="flex items-center gap-2">
                <Search className="h-4 w-4" /> Browse Opportunities
              </TabsTrigger>
              <TabsTrigger value="applications" className="flex items-center gap-2">
                <Handshake className="h-4 w-4" /> My Applications
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="browse" className="mt-0 space-y-6">
              <div className="flex justify-between items-center">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by brand, description, or type..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <p>Loading collaborations...</p>
                </div>
              ) : filteredCollaborations.length === 0 ? (
                <div className="text-center py-12 bg-muted/40 rounded-lg">
                  <Handshake className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No collaborations found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery.trim() !== '' 
                      ? "Try adjusting your search terms"
                      : "Be the first to create a collaboration opportunity"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredCollaborations.map((collab) => (
                    <Card key={collab.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{collab.brand_name}</CardTitle>
                          <Badge>{formatCollaborationType(collab.collaboration_type)}</Badge>
                        </div>
                        <CardDescription className="mt-2">
                          {collab.brand_description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-1">Requirements</h4>
                          <p className="text-sm text-muted-foreground">{collab.requirements}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Compensation</h4>
                          <p className="text-sm text-muted-foreground">{collab.compensation}</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          onClick={() => {
                            setApplyingToId(collab.id);
                            setApplicationMessage("");
                          }}
                          // Disable if user has already applied
                          disabled={applications.some(app => app.collaboration_id === collab.id)}
                        >
                          {applications.some(app => app.collaboration_id === collab.id)
                            ? "Applied"
                            : "Apply Now"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="applications" className="mt-0 space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <p>Loading applications...</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 bg-muted/40 rounded-lg">
                  <Handshake className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                  <p className="text-muted-foreground">
                    Browse opportunities and apply to start collaborating with brands
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {applications.map((app) => (
                    <Card key={app.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{app.brand_name}</CardTitle>
                          <Badge 
                            variant={
                              app.status === 'approved' ? 'default' : 
                              app.status === 'rejected' ? 'destructive' : 
                              'outline'
                            }
                          >
                            {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>
                          Applied on {new Date(app.created_at).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/40 p-3 rounded-md text-sm">
                          <p className="font-medium mb-1">Your message:</p>
                          <p className="text-muted-foreground">{app.message}</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          disabled={app.status !== 'approved'}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {app.status === 'approved' ? 'Contact Brand' : 'Awaiting Response'}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      {/* Create Collaboration Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Collaboration Opportunity</DialogTitle>
            <DialogDescription>
              Share details about your brand and the collaboration you're looking for
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name</Label>
              <Input 
                id="brand_name" 
                value={newCollaboration.brand_name}
                onChange={(e) => setNewCollaboration({...newCollaboration, brand_name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand_description">Brand Description</Label>
              <Textarea 
                id="brand_description" 
                value={newCollaboration.brand_description}
                onChange={(e) => setNewCollaboration({...newCollaboration, brand_description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="collaboration_type">Collaboration Type</Label>
              <Select 
                value={newCollaboration.collaboration_type}
                onValueChange={(value) => setNewCollaboration({...newCollaboration, collaboration_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sponsored_post">Sponsored Post</SelectItem>
                  <SelectItem value="brand_ambassador">Brand Ambassador</SelectItem>
                  <SelectItem value="affiliate">Affiliate Marketing</SelectItem>
                  <SelectItem value="product_review">Product Review</SelectItem>
                  <SelectItem value="event">Event Promotion</SelectItem>
                  <SelectItem value="content_creation">Content Creation</SelectItem>
                  <SelectItem value="takeover">Account Takeover</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea 
                id="requirements" 
                placeholder="Audience size, engagement rate, content type, etc."
                value={newCollaboration.requirements}
                onChange={(e) => setNewCollaboration({...newCollaboration, requirements: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="compensation">Compensation</Label>
              <Textarea 
                id="compensation" 
                placeholder="Payment details, product value, or other benefits"
                value={newCollaboration.compensation}
                onChange={(e) => setNewCollaboration({...newCollaboration, compensation: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCollaboration}
              disabled={!newCollaboration.brand_name || !newCollaboration.brand_description}
            >
              Create Opportunity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Apply Dialog */}
      <Dialog open={!!applyingToId} onOpenChange={(open) => !open && setApplyingToId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Collaboration</DialogTitle>
            <DialogDescription>
              Send a message to the brand explaining why you'd be a great fit
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea 
                id="message" 
                placeholder="Introduce yourself, share your statistics, and explain why you're interested..."
                className="min-h-[150px]"
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setApplyingToId(null)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => applyingToId && handleApply(applyingToId)}
              disabled={!applicationMessage.trim()}
            >
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Collaborations;
