import Button from '@/components/Button';
import { usePhoneStore } from '@/store/usePhoneStore';
import { usePinStore } from '@/store/usePinStore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Clipboard, Image, Modal, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import InputEndIcon from '../../../../assets/images//paste.png';
import BackButton from '../../../../assets/images/back.png';
import CopyIcon from '../../../../assets/images/Copy.png';
import DidCreationImage1 from '../../../../assets/images/did_creation.png';
import DidCreationImage4 from '../../../../assets/images/did_creation4.png';
import Progress100 from '../../../../assets/images/progress100.png';
import Progress30 from '../../../../assets/images/progress30.png';
import QRCodeImage from '../../../../assets/images/QR Code.png';
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

const BASE_URL = 'https://k33p-backend-0kyx.onrender.com/api';

const generateUserId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${random}`;
};

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
  const [sendingAddress, setSendingAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [refundStatus, setRefundStatus] = useState({
    refunded: false,
    txHash: '',
  });
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { phoneNumber } = usePhoneStore();
  const { pin } = usePinStore();

  const walletAddress = "addr_test1qquds2rqarqkk40lncfu88cwhptxekt7j0eccucpd2a43a35pel7jwkfmsf8zrjwsklm4czm5wqsgxwst5mrw86kt84qs7m4na"; 

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

  const handleSignup = async () => {
    try {
      setIsLoading(true);
      const userId = generateUserId();
      const biometricData = "static_biometric_data";

      const payload = {
        userAddress: walletAddress,
        userId,
        phoneNumber,
        pin,
        biometricData,
        verificationMethod: "pin",
        senderWalletAddress: sendingAddress
      };

      console.log("Signup payload:", payload);

      const response = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (!data.success && data.message?.includes("User already exists")) {
        alert("Account already exists with this user ID. Please log in or use a different user ID.");
        return;
      }

      if (data.success && data.data?.verified === false && data.data?.message?.includes("Please send")) {
          alert("Payment not yet detected. Please ensure you have sent exactly 2 ADA to the deposit address.");
          return;
      }

      if (response.ok && data.success && data.data?.verified) {
        console.warn("Proceeding with refund...");
        setShowConfirmationModal(true);
        setShowProgress(true);
        startPollingForRefund();

        setTimeout(() => {
          router.push('/sign-up/name');
        }, 3000);
      } else {
        console.warn("Signup failed:", data);
        alert("Signup failed. Please try again or contact support if the issue persists.");
      }

    } catch (error) {
      console.error("Signup error:", error);
      alert("Error processing signup. Please try again.");
    } finally {
      setIsLoading(false);
    }
};
  
  const startPollingForRefund = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(checkRefundStatus, 30000);
    
    checkRefundStatus();
  };

  const checkRefundStatus = async () => {
    try {
      const response = await fetch(`${BASE_URL}/user/${sendingAddress}/status`);
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        const status = data.data;
  
        setRefundStatus({
          refunded: status.refunded,
          txHash: status.txHash || '',
        });
  
        if (status.refunded) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
  
          setCurrentDidImage(DidCreationImage4);
          setCurrentProgressImage(Progress100);
          setProgressText('Refund of 2 ADA Collateral to the connected wallet is complete.');
  
          setTimeout(() => router.push('/sign-up/name'), 3000);
        }
      } else {
        console.warn('Refund check failed:', data);
      }
    } catch (error) {
      console.error('Error checking refund status:', error);
    }
  };
  

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (showProgress) {
      if (refundStatus.refunded) {
        setProgressText('Refund of 2 ADA Collateral to the connected wallet is complete.');
      } else {
        setProgressText('DID creation in progress....Refund of Collateral will proceed after DID is created.');
      }
    }
  }, [refundStatus, showProgress]);

  const handleProceed = () => {
    setShowSendAdaModal(true);
  };

  const handleConnectWallet = (walletName) => {
    if (!acceptedPrivacy) return;
    setShowSendAdaModal(true);
  };

  const handleCopyAddress = () => {
    Clipboard.setString(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendAda = () => {
    handleSignup();
  };

  return (
    <View className="flex-1 bg-mainBlack px-5 pt-12">
      <View className="relative flex-row items-center justify-start mb-12">
        <TouchableOpacity className="z-10" onPress={() => router.back()}>
          <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <View className="flex-1">
        <Text className="text-white font-sora-bold text-sm mb-1">
          DID Creation / Vault Setup
        </Text>

        <View className="mt-2 mb-8">
          {['Mobile Number ', 'PIN Setup', 'Face ID'].map((item, index) => (
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

        <Text className="text-white font-sora-bold text-sm mb-2">
          Vault Creation 
        </Text>
        <Text className="text-neutral100 font-sora text-sm mb-6 mr-10">
          A collateral of 2 ADA is required to verify account on-chain & vault SetUp
        </Text>

        <View className="items-center px-6 mb-4">
          <Image 
            source={currentDidImage} 
            className="w-full" 
            resizeMode="contain" 
          />
        </View>

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
            
            {refundStatus.txHash && (
              <Text className="text-green-500 mt-2 font-sora text-xs">
                Refund TX: {refundStatus.txHash.slice(0, 12)}...{refundStatus.txHash.slice(-6)}
              </Text>
            )}
            
            {!refundStatus.refunded && (
              <Button
                text="Check Refund Status"
                onPress={checkRefundStatus}
                className="mt-4"
                outline
              />
            )}
          </View>
        )}
      </View>

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
                
                <View className="flex-row justify-between items-center mb-6">
                  <TouchableOpacity onPress={() => setShowWalletModal(false)}>
                    <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
                  </TouchableOpacity>
                  <Text className="text-white font-sora-bold text-sm">
                    Connect Wallet
                  </Text>
                  <TouchableOpacity onPress={() => setShowSendAdaModal(true)}>
                    <Image source={ScanBarcodeIcon} className="w-6 h-6" resizeMode="contain" />
                  </TouchableOpacity>
                </View>

                <Text className="text-neutral100 font-sora text-sm my-4">
                  Choose Wallet
                </Text>

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

                <Text className="text-neutral100 font-sora text-sm my-4">
                  Install supported wallets
                </Text>

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
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
          visible={showSendAdaModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSendAdaModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowSendAdaModal(false)}>
            <View className="flex-1 justify-end">
              <TouchableWithoutFeedback>
                <View className="bg-mainBlack rounded-t-3xl px-6 pb-8">
                  
                  <TouchableOpacity className="items-center pt-3 pb-12" onPress={() => setShowSendAdaModal(false)}>
                    <View className="w-16 h-1 bg-neutral100 rounded-full" />
                  </TouchableOpacity>

                  <Text className="text-white font-sora-bold text-lg text-center mb-6">
                    Send 2 ADA
                  </Text>

                  <View className="items-center mb-6">
                    <Image 
                      source={QRCodeImage} 
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

                  <Text
                    style={{ letterSpacing: .78 }} 
                    className="text-white text-xs text-center font-space-mono mb-4 px-5 leading-relaxed break-words max-w-[300px] mx-auto"
                    numberOfLines={3}
                  >
                    {walletAddress}
                  </Text>

                  <TouchableOpacity 
                    className="flex-row items-center justify-center mb-8"
                    onPress={handleCopyAddress}
                  >
                    {copied ? (
                      <Ionicons name="checkmark" size={16} color="#FFD939" className="mr-2" />
                    ) : (
                      <Image 
                        source={CopyIcon}
                        className="w-5 h-5 mr-2"
                        resizeMode="contain"
                      />
                    )}

                    <Text className={`font-sora text-sm ${copied ? "text-main" : "text-neutral200"}`}>
                      {copied ? "Copied!" : "Copy"}
                    </Text>
                  </TouchableOpacity>
                  
                  <View className="mb-8 w-full mt-5">
                    <Text className="text-white font-sora text-sm mb-3">
                      Your sending address
                    </Text>
                    <View className="flex-row items-center border border-neutral200 rounded-md px-3 ">
                      <TextInput
                        placeholder="Paste ADA address"
                        placeholderTextColor="#A0A0A0"
                        className="flex-1 text-white font-sora text-sm h-12"
                        value={sendingAddress}
                        onChangeText={setSendingAddress}
                      />
                      <Image 
                        source={InputEndIcon} 
                        className="ml-2"
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                  
                <View className="flex-row items-center mt-3 mb-4">
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

                  <Button
                    text={isLoading ? "Processing..." : "I have sent 2 ADA"}
                    onPress={handleSendAda}
                    isDisabled={!sendingAddress || !acceptedPrivacy || isLoading}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>


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
                <TouchableOpacity className="items-center pt-3 " onPress={() => setShowConfirmationModal(false)}>
                  <View className="w-14 h-1 bg-neutral100 rounded-full mb-10" />
                </TouchableOpacity>

                <Text className="text-neutral200 font-sora text-xs text-center mb-2">Connected Wallet</Text>
                <Text className="text-white font-space-mono-bold uppercase text-sm text-center mb-20">
                  {sendingAddress.length > 15
                    ? `${sendingAddress.slice(0, 15)}...`
                    : sendingAddress}
                </Text>
                
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
                    {refundStatus.refunded
                      ? "Refund processed successfully!"
                      : "A collateral of 2 ADA is required to verify your account setup."}
                  </Text>
                </View>

                <View className="items-center px-6 my-16">
                  <Image 
                    source={currentDidImage} 
                    className="w-full" 
                    resizeMode="contain" 
                  />
                </View>
                
                <Text className="text-main font-sora text-xs text-center mb-5">
                  Note: 
                  <Text className="text-neutral100"> Collateral will be fully refunded upon completion of vault setup</Text>
                </Text>
                
                <Button
                  text={refundStatus.refunded ? "Redirecting..." : "Please wait..."}
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