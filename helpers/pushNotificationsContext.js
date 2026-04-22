import React from 'react';

export const PushNotificationsContext = React.createContext({
  useCustomNotification: false,
  setUseCustomNotification: () => {},
});
