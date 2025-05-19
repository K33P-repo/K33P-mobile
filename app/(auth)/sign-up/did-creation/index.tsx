import Button from '@/components/Button';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Clipboard, Image, Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import BackButton from '../../../../assets/images/back.png';
import DidCreationImage1 from '../../../../assets/images/did_creation.png';
import DidCreationImage2 from '../../../../assets/images/did_creation2.png';
import DidCreationImage3 from '../../../../assets/images/did_creation3.png';
import DidCreationImage4 from '../../../../assets/images/did_creation4.png';
import Progress100 from '../../../../assets/images/progress100.png';
import Progress30 from '../../../../assets/images/progress30.png';
import Progress70 from '../../../../assets/images/progress70.png';
import QRCodeImage from '../../../../assets/images/qr-code.png';
import ScanBarcodeIcon from '../../../../assets/images/scan-barcode.png';
import SuccessImage from '../../../../assets/images/success.png';
import EternlIcon from '../../../../assets/images/wallets/eterni.png';
import LaceIcon from '../../../../assets/images/wallets/lace.png';
import Metamask from '../../../../assets/images/wallets/metamask.png';
import NestIcon from '../../../../assets/images/wallets/nextwallet.png';
import OkxIcon from '../../../../assets/images/wallets/okx.png';
import PhanthomIcon from '../../../../assets/images/wallets/phanthom.png';
import VesprIcon from '../../../../assets/images/wallets/vespt.png';
import ViewAll from '../../../../assets/images/wallets/view-all.png';

export default function DidScreen() {
  const router = useRouter();
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showSendAdaModal, setShowSendAdaModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentDidImage, setCurrentDidImage] = useState(DidCreationImage1);
  const [currentProgressImage, setCurrentProgressImage] = useState(Progress30);
  const [progressText, setProgressText] = useState('DID creation in progress...');
  const [showProgress, setShowProgress] = useState(false);

  const walletAddress = "TW728EDEW723DUH8QWH238HDWSJ8327EEYDU"; 

  const topWallets = [
    { name: 'Eternl', icon: EternlIcon },
    { name: 'Vespr', icon: VesprIcon },
    { name: 'Lace', icon: LaceIcon },
    { name: 'OKX', icon: OkxIcon }
  ];

  const bottomWallets = [
    { name: 'Nest Wallet', icon: NestIcon },
    { name: 'MetaMask', icon: Metamask },
    { name: 'Phantom', icon: PhanthomIcon },
    { name: 'View All', icon: ViewAll }
  ];

  useEffect(() => {
    if (showConfirmationModal) {
      const confirmationTimer = setTimeout(() => {
        setShowConfirmationModal(false);
        setShowWalletModal(false);
        setShowSendAdaModal(false);
        setShowProgress(true);
        startProgressAnimation();
      }, 5000);
      return () => clearTimeout(confirmationTimer);
    }
  }, [showConfirmationModal]);

  const startProgressAnimation = () => {
    // Initial state (30%)
    setCurrentDidImage(DidCreationImage2);
    setCurrentProgressImage(Progress30);
    setProgressText('DID creation in progress....Refund of Collateral will proceed after DID is created.');

    // After 3 seconds (70%)
    const timer70 = setTimeout(() => {
      setCurrentDidImage(DidCreationImage3);
      setCurrentProgressImage(Progress70);
      setProgressText('DID creation in progress....Refund of Collateral will proceed after DID is created.');
    }, 3000);

    // After 6 seconds (100%)
    const timer100 = setTimeout(() => {
      setCurrentDidImage(DidCreationImage4);
      setCurrentProgressImage(Progress100);
      setProgressText('Refund of 2 ADA Collateral to the connected wallet is complete.');
    }, 6000);

    // After 9 seconds (redirect)
    const redirectTimer = setTimeout(() => {
      router.push('/sign-up/name');
    }, 9000);

    return () => {
      clearTimeout(timer70);
      clearTimeout(timer100);
      clearTimeout(redirectTimer);
    };
  };

  const handleProceed = () => {
    setShowWalletModal(true);
  };

  const handleConnectWallet = (walletName: string) => {
    if (!acceptedPrivacy) return;
    
    setSelectedWallet(walletName);
    setShowWalletModal(false);
    setShowSendAdaModal(true);
  };

  const handleCopyAddress = () => {
    Clipboard.setString(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendAda = () => {
    setShowSendAdaModal(false);
    setShowConfirmationModal(true);
  };

  return (
    <View className="flex-1 bg-neutral800 px-5 pt-12">
      {/* Header */}
      <View className="relative flex-row items-center justify-start mb-12">
        <TouchableOpacity className="z-10" onPress={() => router.back()}>
          <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className="text-white font-sora-bold text-sm mb-1">
          DID Creation / Vault Setup
        </Text>

        {/* Verification items with checkmarks */}
        <View className="mt-2 mb-8">
          {['Mobile Number Verification', 'PIN Setup', 'Face ID'].map((item, index) => (
            <View key={index} className="flex-row items-center mb-3">
              <MaterialIcons 
                name="check-circle" 
                size={20} 
                color="#FFD939" 
                className="mr-2"
              />
              <Text className="text-neutral100 font-sora text-sm">
                {item}
              </Text>
            </View>
          ))}
        </View>

        {/* Additional text sections */}
        <Text className="text-white font-sora-bold text-sm mb-2">
          Vault Creation 
        </Text>
        <Text className="text-neutral100 font-sora text-sm mb-6 mr-10">
          A collateral of 2 ADA is required to verify account on-chain & vault SetUp
        </Text>

        {/* DID Creation Image */}
        <View className="items-center px-6 mb-4">
          <Image 
            source={currentDidImage} 
            className="w-full" 
            resizeMode="contain" 
          />
        </View>

        {/* Progress Circle and Text (shown only after ADA is sent) */}
        {showProgress && (
          <View className="items-center mt-12">
            <Image 
              source={currentProgressImage} 
              className="w-52 h-52 mb-4" 
              resizeMode="contain" 
            />
            <Text className="text-main text-center font-sora text-sm">
              {progressText}
            </Text>
          </View>
        )}
      </View>

      {/* Connect Wallet Button and Note (hidden after ADA is sent) */}
      {!showProgress && (
        <View className='mb-10'>
          <Text className="text-main font-sora text-xs text-center mb-4">
            Note: 
            <Text className="text-neutral100"> Collateral will be fully refunded upon completion of vault setup</Text>
          </Text>
          <Button
            text='Connect Wallet'
            onPress={handleProceed}
          />
        </View>
      )}

      {/* Wallet Connection Modal */}
      <Modal
        visible={showWalletModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWalletModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowWalletModal(false)}>
          <View className="flex-1 bg-[#0a0a0a]/90 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-[#1a1a1a] rounded-t-3xl px-6">
                <TouchableOpacity className="items-center pt-3 pb-6" onPress={() => setShowWalletModal(false)}>
                  <View className="w-12 h-1 bg-neutral100 rounded-full" />
                </TouchableOpacity>
                
                {/* Modal Header */}
                <View className="flex-row justify-between items-center mb-6">
                  <TouchableOpacity onPress={() => setShowWalletModal(false)}>
                    <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
                  </TouchableOpacity>
                  <Text className="text-white font-sora-bold text-sm">
                    Connect Wallet
                  </Text>
                  <TouchableOpacity>
                    <Image source={ScanBarcodeIcon} className="w-6 h-6" resizeMode="contain" />
                  </TouchableOpacity>
                </View>

                {/* Choose Wallet Text */}
                <Text className="text-neutral100 font-sora text-sm my-4">
                  Choose Wallet
                </Text>

                {/* Top Row Wallets - Horizontal */}
                <View className="flex-row justify-between mb-4">
                  {topWallets.map((wallet, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`flex-col items-center p-2 ${selectedWallet === wallet.name ? 'bg-neutral700/50' : ''}`}
                      onPress={() => handleConnectWallet(wallet.name)}
                    >
                      <Image 
                        source={wallet.icon} 
                        className="w-16 h-16 mb-3" 
                        resizeMode="contain" 
                      />
                      <Text className="text-white font-sora text-sm text-center">
                        {wallet.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Supported Wallets Text */}
                <Text className="text-neutral100 font-sora text-sm my-4">
                  Install supported wallets
                </Text>

                {/* Bottom Row Wallets - Horizontal */}
                <View className="flex-row justify-between mb-6">
                  {bottomWallets.map((wallet, index) => (
                    <TouchableOpacity
                      key={index}
                      className={`flex-col items-center p-2 rounded-lg ${selectedWallet === wallet.name ? 'bg-neutral700/50' : ''}`}
                      onPress={() => handleConnectWallet(wallet.name)}
                    >
                      <Image 
                        source={wallet.icon} 
                        className="w-16 h-16 mb-2" 
                        resizeMode="contain" 
                      />
                      <Text className="text-white font-sora text-xs">
                        {wallet.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Privacy Policy Checkbox */}
                <View className="flex-row items-center mt-6 mb-10">
                  <TouchableOpacity 
                    onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
                    className="mr-2"
                  >
                    {acceptedPrivacy ? (
                      <Ionicons name="checkbox" size={24} color="#FFD939" />
                    ) : (
                      <Ionicons name="checkbox-outline" size={24} color="#6B7280" />
                    )}
                  </TouchableOpacity>
                  <Text className="text-neutral200 font-sora text-sm">
                    Accept the <Text className="text-main">Privacy Policy & T&U</Text>
                  </Text>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Send ADA Modal */}
      <Modal
        visible={showSendAdaModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSendAdaModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSendAdaModal(false)}>
          <View className="flex-1 bg-[#0a0a0a]/90 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-[#1a1a1a] rounded-t-3xl px-6 pb-8">
                <TouchableOpacity className="items-center pt-3 pb-12" onPress={() => setShowSendAdaModal(false)}>
                  <View className="w-12 h-1 bg-neutral100 rounded-full" />
                </TouchableOpacity>
                
                <Text className="text-white font-sora-bold text-lg text-center mb-6">
                  Send 2 ADA
                </Text>
                
                <View className="items-center mb-6">
                  <Image 
                    source={QRCodeImage} 
                    className="w-44 h-44" 
                    resizeMode="contain" 
                  />
                </View>
                
                <Text className="text-neutral200 font-sora text-xs text-center mb-6 px-20">
                  Scan QR code with camera to send 2ADA
                </Text>
                
                <View className="flex-row w-full mb-6 overflow-hidden">
                  {[...Array(60)].map((_, i) => (
                    <View 
                      key={i}
                      className="h-px w-1 bg-neutral200 mx-0.5"
                    />
                  ))}
                </View>                
                
                <Text className="text-white text-sm text-center mb-4 px-20">
                  {walletAddress}
                </Text>
                
                <TouchableOpacity 
                  className="flex-row items-center justify-center mb-20"
                  onPress={handleCopyAddress}
                >
                  <FontAwesome 
                    name={copied ? "check" : "copy"} 
                    size={16} 
                    color="#FFD939"
                    className="mr-2"
                  />
                  <Text className={`font-sora text-sm ${copied ? "text-main" : "text-neutral200"}`}>
                    {copied ? "Copied!" : "Copy"}
                  </Text>
                </TouchableOpacity>
                
                <Button
                  text="I have sent 2 ADA"
                  onPress={handleSendAda}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowConfirmationModal(false)}>
          <View className="flex-1 bg-[#0a0a0a]/90 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-[#1a1a1a] rounded-t-3xl px-6 pb-10">
                <TouchableOpacity className="items-center pt-3 mb-28" onPress={() => setShowConfirmationModal(false)}>
                  <View className="w-12 h-1 bg-neutral100 rounded-full" />
                </TouchableOpacity>
                
                <View className="items-center">
                  <Image 
                    source={SuccessImage} 
                    className="mb-5" 
                    resizeMode="contain"
                  />
                  <Text className="text-white font-sora-bold text-lg text-center mb-2">
                    Security Setup Done
                  </Text>
                  <Text className="text-neutral200 font-sora text-sm text-center">
                    A collateral of 2 ADA is required to verify your account setup.
                  </Text>
                </View>

                <View className="items-center px-6 my-16">
                  <Image 
                    source={DidCreationImage2} 
                    className="w-full" 
                    resizeMode="contain" 
                  />
                </View>
                
                <Text className="text-main font-sora text-xs text-center mb-5">
                  Note: 
                  <Text className="text-neutral100"> Collateral will be fully refunded upon completion of vault setup</Text>
                </Text>
                
                <Button
                  text="Please wait..."
                  onPress={() => {}}
                  outline
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}