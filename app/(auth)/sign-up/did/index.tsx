import { WalletConnectModal, useWalletConnectModal } from '@walletconnect/modal-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const projectId = '409491f67431b645b1e831e3cb666660'; 

const providerMetadata = {
  name: 'My Dapp',
  description: 'My first dapp using WalletConnect',
  url: 'https://yourproject.com',
  icons: ['https://yourproject.com/icon.png'],
  redirect: {
    native: 'yourappscheme://',
  },
};

const ConnectWalletScreen = () => {
  const { open, isConnected, address, provider } = useWalletConnectModal();

  const handleWalletPress = async () => {
    if (isConnected) {
      await provider?.disconnect();
    } else {
      open();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Web3 Wallet Connection</Text>
      <Text style={styles.address}>
        {isConnected ? `Connected: ${address}` : 'Not connected'}
      </Text>

      <Pressable onPress={handleWalletPress} style={styles.button}>
        <Text style={styles.buttonText}>
          {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
        </Text>
      </Pressable>

      <WalletConnectModal projectId={projectId} providerMetadata={providerMetadata} />
    </View>
  );
};

export default ConnectWalletScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  address: { marginBottom: 12 },
  button: {
    backgroundColor: '#2f95dc',
    padding: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: { color: 'white', fontSize: 16 },
});
