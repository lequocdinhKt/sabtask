/**
 * File: components/views/ViewManager.tsx
 * Mục đích: Bộ định tuyến view nội bộ của ứng dụng. Dựa vào tab đang chọn trong context,
 * file này chọn và render đúng màn hình (dashboard, projects, kanban, list, calendar,
 * team hub, team, time tracking) và truyền dữ liệu cùng các action tương ứng xuống view đó.
 */

import React from 'react';
import { useApp } from '../../context/AppContext';
import { Dashboard } from '../Dashboard';
import { KanbanBoard } from '../KanbanBoard';
import { TaskListView } from '../TaskListView';
import { CalendarView } from '../CalendarView';
import { TeamView } from '../TeamView';
import { ProjectsView } from '../ProjectsView';
import { ProjectDetailView } from '../ProjectDetailView';
import { TimeTrackingView } from '../TimeTrackingView';
import { MemberDetailView } from '../MemberDetailView';
import { TeamHub } from '../TeamHub';

/**
 * Component điều phối view: chọn màn hình theo tab hiện tại, đồng thời ưu tiên render
 * màn hình chi tiết khi đang có project hoặc thành viên được chọn.
 */
export const ViewManager: React.FC = () => {
  const { state, actions } = useApp();
  
  switch (state.activeTab) {
    case 'dashboard':
      return <div className="max-w-[1600px] mx-auto"><Dashboard tasks={state.tasks} projects={state.projects} onNavigate={actions.setActiveTab} /></div>;
      
    case 'projects':
      if (state.selectedProject) {
        return (
           <div className="max-w-[1600px] mx-auto">
             <ProjectDetailView 
                project={state.selectedProject}
                tasks={state.tasks}
                users={state.users}
                onBack={actions.handleBackToProjects}
                onEditProject={actions.openEditProjectModal}
                onDeleteProject={actions.handleProjectDelete}
                onUpdateTaskStatus={actions.handleUpdateTaskStatus}
                onEditTask={actions.openEditTaskModal}
                onCreateTask={actions.openNewTaskModal}
             />
           </div>
        );
      }
      return (
        <div className="max-w-[1600px] mx-auto">
          <ProjectsView 
             projects={state.projects}
             tasks={state.tasks}
             users={state.users}
             onCreateProject={actions.openNewProjectModal}
             onEditProject={actions.openEditProjectModal}
             onDeleteProject={actions.handleProjectDelete}
             onProjectClick={actions.handleProjectClick}
          />
        </div>
      );

    case 'kanban':
      return (
        <div className="flex flex-col animate-fade-in min-h-full">
           <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Project Board</h2>
           </div>
           <div className="flex-1">
             <KanbanBoard 
                tasks={state.tasks} 
                projects={state.projects}
                filters={state.filters}
                setFilters={actions.setFilters}
                users={state.users}
                onUpdateTaskStatus={actions.handleUpdateTaskStatus}
                onEditTask={actions.openEditTaskModal}
                onCreateTask={actions.openNewTaskModal}
             />
           </div>
        </div>
      );

    case 'list':
      return (
        <div className="max-w-[1600px] mx-auto animate-fade-in">
           <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight">Task List</h2>
           <TaskListView 
              tasks={state.tasks} 
              users={state.users}
              projects={state.projects}
              filters={state.filters}
              setFilters={actions.setFilters}
              onEditTask={actions.openEditTaskModal}
              onUpdateStatus={actions.handleUpdateTaskStatus}
           />
        </div>
      );

    case 'calendar':
      return (
        <div className="h-full animate-fade-in">
           <CalendarView 
              tasks={state.tasks} 
              onEditTask={actions.openEditTaskModal}
           />
        </div>
      );
    
    case 'hub':
      return (
        <div className="h-full animate-fade-in">
           <TeamHub />
        </div>
      );

    case 'team':
      if (state.selectedMember) {
        return (
          <div className="max-w-[1600px] mx-auto">
            <MemberDetailView 
              member={state.selectedMember}
              tasks={state.rawTasks}
              projects={state.projects}
              onBack={actions.handleBackToTeam}
              onEditMember={actions.openEditMemberModal}
              onDeleteMember={(id) => {
                  actions.handleDeleteMember(id);
                  actions.handleBackToTeam();
              }}
              onEditTask={actions.openEditTaskModal}
              onUpdateTaskStatus={actions.handleUpdateTaskStatus}
            />
          </div>
        );
      }
      return (
         <div className="max-w-[1600px] mx-auto">
           <TeamView 
             currentUser={state.user}
             users={state.users} 
             tasks={state.rawTasks} 
             onAddMember={actions.openNewMemberModal}
             onEditMember={actions.openEditMemberModal}
             onDeleteMember={actions.handleDeleteMember}
             onMemberClick={actions.handleMemberClick}
           />
         </div>
      );

    case 'time':
      return (
         <div className="max-w-[1600px] mx-auto">
           <TimeTrackingView 
              timeEntries={state.timeEntries}
              tasks={state.rawTasks}
              projects={state.projects}
           />
         </div>
      );

    default:
      return null;
  }
};
