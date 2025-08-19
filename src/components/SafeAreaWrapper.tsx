import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  topSafe?: boolean;
  bottomSafe?: boolean;
  leftSafe?: boolean;
  rightSafe?: boolean;
  backgroundColor?: string;
}

const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  topSafe = true,
  bottomSafe = true,
  leftSafe = true,
  rightSafe = true,
  backgroundColor = 'transparent',
}) => {
  const insets = useSafeAreaInsets();

  const safeAreaStyle: ViewStyle = {
    paddingTop: topSafe ? insets.top : 0,
    paddingBottom: bottomSafe ? insets.bottom : 0,
    paddingLeft: leftSafe ? insets.left : 0,
    paddingRight: rightSafe ? insets.right : 0,
    backgroundColor,
  };

  return (
    <View style={[styles.container, safeAreaStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper;
