/**
 * File: TaskModal.tsx
 * Trách nhiệm: Modal tạo/sửa task — ghép header, tabs, form, footer.
 * Liên quan: useTaskForm.ts, task-modal/* sub-components.
 */

import React from 'react';
import { TaskModalProps } from '../types';
import { useTaskForm } from '../hooks/useTaskForm';
import { useApp } from '../context/AppContext';

// Sub Components
import { TaskModalHeader } from './task-modal/TaskModalHeader';
import { TaskModalTabs } from './task-modal/TaskModalTabs';
import { TaskModalFooter } from './task-modal/TaskModalFooter';
import { TaskDetails } from './task-modal/TaskDetails';
import { TaskSubtasks } from './task-modal/TaskSubtasks';
import { TaskComments } from './task-modal/TaskComments';

/** Modal task chính — details, subtasks, comments và timer */
export const TaskModal: React.FC<TaskModalProps> = (props) => {
  const { state } = useApp();
  const { formState, uiState, handlers } = useTaskForm(props);
  const isTimerActiveForTask = state.activeTimer?.taskId === props.task?.id;

  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        <TaskModalHeader 
            task={props.task}
            isTimerActive={isTimerActiveForTask}
            onClose={props.onClose}
            onStartTimer={handlers.handleStartTimer}
            onStopTimer={handlers.handleStopTimer}
        />

        <TaskModalTabs 
            activeTab={uiState.activeTab}
            setActiveTab={uiState.setActiveTab}
            subtasksCount={formState.subtasks.length}
            commentsCount={formState.comments.length}
        />

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {uiState.activeTab === 'details' && (
            <TaskDetails 
              {...formState}
              projects={props.projects}
              users={props.users}
              isGenerating={uiState.isGenerating}
              onAutoPriority={handlers.handleAIPriority}
              onSuggestSubtasks={handlers.handleAISubtasks}
            />
          )}

          {uiState.activeTab === 'subtasks' && (
            <TaskSubtasks 
              subtasks={formState.subtasks}
              users={props.users}
              onAdd={handlers.addSubtask}
              onUpdate={handlers.updateSubtask}
              onDelete={handlers.deleteSubtask}
            />
          )}

          {uiState.activeTab === 'comments' && (
            <TaskComments 
              comments={formState.comments}
              users={props.users}
              newComment={formState.newComment}
              setNewComment={formState.setNewComment}
              onAdd={handlers.addComment}
            />
          )}
        </div>

        <TaskModalFooter 
            task={props.task}
            onDelete={props.onDelete ? handlers.handleDelete : undefined}
            onClose={props.onClose}
            onSave={handlers.handleSubmit}
        />
      </div>
    </div>
  );
};
