import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  Catalog: undefined;
  Search: undefined;
  Favorites: undefined;
  Captured: undefined;
};

export type AppStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Details: {
    id: number;
    name: string;
  };
};
