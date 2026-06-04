"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Send, Search, Trash2, Edit2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SchedulePage() {
  const [date, setDate] = useState<Date>();
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");

  const handleSchedule = () => {
    if (!recipient || !message || !date) {
      toast.error("Please fill in all details");
      return;
    }
    toast.success("Message scheduled successfully!");
    // Form clear logic here
    setRecipient("");
    setMessage("");
    setDate(undefined);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scheduled Messages</h1>
        <p className="text-muted-foreground mt-1">
          Create, edit, and manage your upcoming automated messages.
        </p>
      </div>

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="create">New Message</TabsTrigger>
          <TabsTrigger value="active">Active Schedules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-6">
          <Card className="bg-card/50 backdrop-blur-md max-w-2xl">
            <CardHeader>
              <CardTitle>Schedule a Message</CardTitle>
              <CardDescription>
                Define the recipient, message content, and exactly when to send it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Number</Label>
                <Input 
                  id="recipient" 
                  placeholder="+1 (123) 456-7890" 
                  type="tel"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <p className="text-[0.8rem] text-muted-foreground">Include country code. Example: +1 for US, +91 for India.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message" 
                  placeholder="Hey, just a reminder about our meeting tomorrow..." 
                  className="min-h-[120px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`w-full justify-start text-left font-normal ${!date && "text-muted-foreground"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" className="w-full" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recurrence</Label>
                <Select defaultValue="once">
                  <SelectTrigger>
                    <SelectValue placeholder="Select Recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSchedule} className="w-full" size="lg">
                <Send className="mr-2 h-4 w-4" /> Schedule Message
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <Card className="bg-card/50 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Active Schedules</CardTitle>
                <CardDescription>Messages waiting to be sent.</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-8" />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Message Info</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Recurrence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { number: '+1234567890', msg: 'Happy birthday!', date: 'Tomorrow 9:00 AM', status: 'Pending', type: 'Once' },
                    { number: '+9876543210', msg: 'Team Standup reminder', date: 'Today 10:00 AM', status: 'Pending', type: 'Daily' },
                  ].map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{row.number}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {row.msg}
                      </TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>
                        <Badge variant={row.type === 'Once' ? 'outline' : 'secondary'}>{row.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 border-none">
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
