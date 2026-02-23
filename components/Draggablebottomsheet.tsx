// components/DraggableBottomSheet.tsx
// Uses only React Native core — no reanimated or gesture-handler required
import React, {
    useCallback,
    useImperativeHandle,
    useRef,
} from 'react';
import {
    Animated,
    Dimensions,
    Modal,
    PanResponder,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
  
  const { height: SCREEN_HEIGHT } = Dimensions.get('window');
  
  export interface DraggableBottomSheetRef {
    open: () => void;
    close: () => void;
  }
  
  interface Props {
    children: React.ReactNode;
    snapHeight?: number | string; // e.g. 500 or '70%'
    onClose?: () => void;
    backgroundColor?: string;
  }
  
  const DraggableBottomSheet = React.forwardRef<DraggableBottomSheetRef, Props>(
    (
      {
        children,
        snapHeight = '70%',
        onClose,
        backgroundColor = '#1A1A1A',
      },
      ref,
    ) => {
      const [visible, setVisible] = React.useState(false);
  
      const sheetHeight =
        typeof snapHeight === 'string' && snapHeight.endsWith('%')
          ? SCREEN_HEIGHT * (parseFloat(snapHeight) / 100)
          : Number(snapHeight);
  
      // translateY: 0 = fully visible, sheetHeight = off-screen below
      const translateY = useRef(new Animated.Value(sheetHeight)).current;
      const backdropOpacity = useRef(new Animated.Value(0)).current;
      const dragStartY = useRef(0);
  
      const closeSheet = useCallback(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: sheetHeight,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(backdropOpacity, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setVisible(false);
          onClose?.();
        });
      }, [sheetHeight, onClose, translateY, backdropOpacity]);
  
      const openSheet = useCallback(() => {
        translateY.setValue(sheetHeight);
        backdropOpacity.setValue(0);
        setVisible(true);
        setTimeout(() => {
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              damping: 18,
              stiffness: 120,
              useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start();
        }, 10);
      }, [sheetHeight, translateY, backdropOpacity]);
  
      useImperativeHandle(ref, () => ({
        open: openSheet,
        close: closeSheet,
      }));
  
      const panResponder = useRef(
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: (_, gs) =>
            Math.abs(gs.dy) > Math.abs(gs.dx) && gs.dy > 0,
          onPanResponderGrant: () => {
            dragStartY.current = (translateY as any)._value ?? 0;
          },
          onPanResponderMove: (_, gs) => {
            const next = dragStartY.current + gs.dy;
            if (next >= 0) {
              translateY.setValue(next);
              const progress = 1 - next / sheetHeight;
              backdropOpacity.setValue(Math.max(0, Math.min(1, progress)));
            }
          },
          onPanResponderRelease: (_, gs) => {
            const currentY = (translateY as any)._value ?? 0;
            const shouldDismiss = currentY > sheetHeight * 0.3 || gs.vy > 0.8;
            if (shouldDismiss) {
              closeSheet();
            } else {
              Animated.parallel([
                Animated.spring(translateY, {
                  toValue: 0,
                  damping: 18,
                  stiffness: 120,
                  useNativeDriver: true,
                }),
                Animated.timing(backdropOpacity, {
                  toValue: 1,
                  duration: 200,
                  useNativeDriver: true,
                }),
              ]).start();
            }
          },
        }),
      ).current;
  
      if (!visible) return null;
  
      return (
        <Modal
          transparent
          visible={visible}
          animationType="none"
          onRequestClose={closeSheet}
          statusBarTranslucent
        >
          {/* Backdrop */}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              styles.backdrop,
              { opacity: backdropOpacity },
            ]}
          >
            <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          </Animated.View>
  
          {/* Sheet */}
          <Animated.View
            style={[
              styles.sheet,
              { height: sheetHeight, backgroundColor },
              { transform: [{ translateY }] },
            ]}
          >
            {/* Drag handle — PanResponder only on this zone */}
            <View {...panResponder.panHandlers} style={styles.handleZone}>
              <View style={styles.handle} />
            </View>
  
            {children}
          </Animated.View>
        </Modal>
      );
    },
  );
  
  DraggableBottomSheet.displayName = 'DraggableBottomSheet';
  
  export default DraggableBottomSheet;
  
  const styles = StyleSheet.create({
    backdrop: {
      backgroundColor: 'rgba(0,0,0,0.75)',
    },
    sheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
    },
    handleZone: {
      alignItems: 'center',
      paddingTop: 8,
      paddingBottom: 8,
      minHeight: 20,
    },
    handle: {
      width: 52,
      height: 3,
      borderRadius: 3,
      backgroundColor: '#555',
    },
  });