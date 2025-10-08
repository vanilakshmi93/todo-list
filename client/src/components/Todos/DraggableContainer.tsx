import axios from 'axios';
import React, { useState, useEffect } from 'react';
import type { Todo } from './TodoList';

// This interface extends Todo and can be used for additional drag-drop specific properties if needed
export interface DraggableTodo extends Todo {}

interface DraggableContainerProps {
  items: DraggableTodo[];
  onOrderChange: (newItems: DraggableTodo[]) => void;
  renderItem: (item: DraggableTodo, index: number) => React.ReactNode;
}

const DraggableContainer: React.FC<DraggableContainerProps> = ({ 
  items,
  onOrderChange,
  renderItem 
}) => {
  const [orderedItems, setOrderedItems] = useState<DraggableTodo[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize orderedItems when items change
  useEffect(() => {
    if (items && items.length > 0) {
      setOrderedItems(items);
    }
  }, [items]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    // Store the index as a number type as required by the task
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    const updatedItems = [...orderedItems];
    const [movedItem] = updatedItems.splice(draggedIndex, 1);
    updatedItems.splice(dropIndex, 0, movedItem);
    
    setOrderedItems(updatedItems);
    setDraggedIndex(null);
  
    onOrderChange(updatedItems);
    
    // Send reorder request to backend with correct endpoint and user ID
    const userId = localStorage.getItem('userId');
    // const API_URL = process.env.NODE_ENV === 'production' 
    //   ? 'https://todo-backend-8occ.onrender.com' 
    //   : 'http://localhost:5000';
    const API_URL = 'http://localhost:5000'; // Adjust as necessary
      
    axios.patch(`${API_URL}/todos/reorder`, { 
      userId: userId,
      todos: updatedItems.map(todo => ({ _id: todo._id })) 
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      withCredentials: true
    }).catch(err => console.error('Error reordering todos:', err));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="draggable-container">
      {orderedItems.map((item, index) => (
        <div
          key={item._id}
          draggable
          onDragStart={(e) => handleDragStart(e as React.DragEvent<HTMLDivElement>, index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e as React.DragEvent<HTMLDivElement>, index)}
          className="transition-all duration-300 hover:shadow-md"
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};

export default DraggableContainer;