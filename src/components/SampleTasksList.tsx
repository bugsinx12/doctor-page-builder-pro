
import { useState, useEffect } from 'react';
import { useClerkSupabaseClient } from '@/hooks/useClerkSupabaseClient';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

// Sample component to demonstrate using the Clerk-authenticated Supabase client
const SampleTasksList = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { client, isAuthenticated, isLoading: authLoading } = useClerkSupabaseClient();
  
  // Fetch tasks using the authenticated client
  const fetchTasks = async () => {
    if (!isAuthenticated || !client) return;
    
    try {
      setLoading(true);
      
      // Client has Clerk token injected automatically
      const { data, error } = await client
        .from('tasks')
        .select('*');
      
      if (error) {
        console.error("Error fetching tasks:", error);
        return;
      }
      
      if (data) {
        console.log("Tasks fetched successfully:", data);
        setTasks(data);
      }
    } catch (err) {
      console.error("Unexpected error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add a new task
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTask.trim() || !isAuthenticated || !client) return;
    
    try {
      setAdding(true);
      
      // Client has Clerk token injected automatically
      const { data, error } = await client
        .from('tasks')
        .insert({ name: newTask.trim() })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding task:", error);
        return;
      }
      
      if (data) {
        console.log("Task added successfully:", data);
        setTasks([...tasks, data]);
        setNewTask('');
      }
    } catch (err) {
      console.error("Unexpected error adding task:", err);
    } finally {
      setAdding(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && !authLoading && client) {
      fetchTasks();
    }
  }, [isAuthenticated, authLoading, client]);
  
  if (authLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg">
        <p className="text-center text-gray-500">Please sign in to view and manage tasks.</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Tasks</h2>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks found. Add your first task below!</p>
          ) : (
            <ul className="space-y-2 mb-6">
              {tasks.map((task) => (
                <li 
                  key={task.id}
                  className="p-3 bg-gray-50 rounded-md"
                >
                  {task.name}
                </li>
              ))}
            </ul>
          )}
          
          <form onSubmit={addTask} className="flex space-x-2">
            <Input
              type="text"
              placeholder="Add a new task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              disabled={adding}
              className="flex-grow"
            />
            <Button type="submit" disabled={adding || !newTask.trim()}>
              {adding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default SampleTasksList;
