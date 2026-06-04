import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  CheckCircle2, 
  Clock, 
  MessageCircleQuestion, 
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your messaging.
          </p>
        </div>
        <Button asChild className="rounded-full shadow-lg shadow-primary/20">
          <Link href="/dashboard/schedule">Schedule Message</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sent
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">128</div>
            <p className="text-xs text-muted-foreground mt-1">
              +14% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Messages
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              Next message in 45m
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Failed
            </CardTitle>
            <MessageCircleQuestion className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              100% delivery rate
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:border-primary/50 transition-colors bg-card/50 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              WhatsApp Status
            </CardTitle>
            <Settings2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-primary flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              Connected
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last synced 2m ago
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
            <CardDescription>
              A log of your recently executed scheduled messages.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Reminder: Pay electricity bill</p>
                    <p className="text-sm text-muted-foreground">
                      To: +1 (234) 567-890
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2 font-medium">
                    <span className="text-xs text-muted-foreground">Today at 10:00 AM</span>
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-card/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>
              Messages scheduled for the future.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Happy Birthday John!</p>
                    <p className="text-sm text-muted-foreground">
                      To: +1 (987) 654-321
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-xs text-muted-foreground">
                    Tomorrow, 12:00 AM
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
