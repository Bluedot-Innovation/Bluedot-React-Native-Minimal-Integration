declare module 'react-native-config' {
  export interface NativeConfig {
      FIREBASE_ENABLED?: Boolean;
  }
  
  export const Config: NativeConfig
  export default Config
}
