import { createContext } from 'react';

// Minimal no-op notification provider.
// Keeps the same API (`addNotification`, `removeNotification`) so existing
// components that call notifications do not need changes. The UI has been
// removed, so notifications are effectively disabled.
export const NotificationContext = createContext({
  addNotification: () => {},
  removeNotification: () => {},
  notifications: [],
});

export const NotificationProvider = ({ children }) => {
  const addNotification = (_message, _type = 'info') => {
    // no-op: notifications disabled in this build
    return null;
  };

  const removeNotification = (_id) => {
    // no-op
    return null;
  };

  return (
    <NotificationContext.Provider value={{ notifications: [], addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
