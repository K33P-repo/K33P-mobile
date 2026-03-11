import { BackIcon } from '@/assets/images/svg';
import Button from '@/components/Button';
import { useAuthStore } from '@/store/useAuthMethod';
import { usePhoneStore } from '@/store/usePhoneStore';
import { usePinStore } from '@/store/usePinStore';
import {
  completeRefund,
  createAuthMethods,
  generateZKCommitment,
  generateZKProof,
  initiateRefund,
  signupUser
} from '@/utils/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Clipboard, Image, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from 'react-native';
import CopyIcon from '../../../../assets/images/Copy.png';
import DidCreationFailed from '../../../../assets/images/did-failed.png';
import DidCreationImage1 from '../../../../assets/images/did_creation.png';
import DidCreationImage2 from '../../../../assets/images/did_creation2.png';
import DidCreationImage3 from '../../../../assets/images/did_creation3.png';
import DidCreationImage4 from '../../../../assets/images/did_creation4.png';
import InputEndIcon from '../../../../assets/images/paste.png';
import Progress100 from '../../../../assets/images/progress100.png';
import Progress30 from '../../../../assets/images/progress30.png';
import Progress70 from '../../../../assets/images/progress70.png';
import QRCodeImage from '../../../../assets/images/QR Code-.png';
import SuccessImage from '../../../../assets/images/success.png';

const generateUserId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `user_${timestamp}_${random}`;
};

export default function DidScreen() {
  const router = useRouter();
  const [showSendAdaModal, setShowSendAdaModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
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
  const [currentStep, setCurrentStep] = useState<'commitment' | 'account' | 'refund' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryData, setRetryData] = useState<{
    userId?: string;
    commitment?: string;
    proof?: any;
  }>({});
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const zkProofRef = useRef<any>(null);
  const zkCommitmentRef = useRef<string | null>(null);

  const { phoneNumber } = usePhoneStore();
  const { pin } = usePinStore();
  const { setUserId, setWalletAddress, setUserAuthMethods, setToken } = useAuthStore();

  const walletAddress = "addr_test1wznyv36t3a2rzfs4q6mvyu7nqlr4dxjwkmykkskafg54yzs735734";

  const showAlert = (title, message) => {
    Alert.alert(title, message);
  };

  const resetFlow = () => {
    setCurrentDidImage(DidCreationImage1);
    setCurrentProgressImage(Progress30);
    setProgressText('DID creation in progress...');
    setError(null);
    setShowProgress(true);
  };
  const [bottomPadding, setBottomPadding] = useState(0);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    });
  
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });
  
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleRetry = async () => {
    if (!currentStep) return;
    
    resetFlow();
    
    if (currentStep === 'commitment') {
      await handleGenerateZKProof();
    } else if (currentStep === 'account') {
      const userId = retryData.userId || generateUserId();
      await createAccountAndLogin(userId);
    } else if (currentStep === 'refund') {
      await triggerImmediateRefund();
    }
  };

  const createAccountAndLogin = async (userId: string) => {
    console.log("--- Creating Account ---");
    setCurrentStep('account');
    setIsLoading(true);
    setRetryData(prev => ({ ...prev, userId })); 
  
    try {
      if (!zkProofRef.current || !zkCommitmentRef.current) {
        setError("Missing ZK proof or commitment");
        setCurrentDidImage(DidCreationFailed);
        setCurrentProgressImage(ProgressFailed);
        setProgressText('Failed to create account. Missing required data.');
        console.log("Missing ZK proof or commitment");
        return;
      }
      
      setCurrentDidImage(DidCreationImage2);
      setCurrentProgressImage(Progress30);
  
      console.log("--- Step 1: Requesting Initial Refund ---");
      
      // Use API utility function
     const initialRefundData = await initiateRefund(sendingAddress);
      console.log("Initial Refund response:", initialRefundData);   
  
      console.log("--- Step 2: Creating Secure Auth Methods ---");
      
      // ✅ ADD AWAIT HERE - Generate encrypted hashes and auth methods
      const authMethods = await createAuthMethods(phoneNumber, pin, userId);
  
      // Prepare signup payload
      const signupPayload = {
        userId: userId,
        userAddress: sendingAddress,
        phoneHash: authMethods.find(m => m.type === 'phone')?.data || '',
        pinHash: authMethods.find(m => m.type === 'pin')?.data || '',
        authMethods: authMethods,
        zkCommitment: zkCommitmentRef.current,
        zkProof: zkProofRef.current,
        verificationMethod: 'phone'
      };
  
      console.log("Signup Payload prepared:", {
        userId: signupPayload.userId,
        userAddress: signupPayload.userAddress,
        hasPhoneHash: !!signupPayload.phoneHash,
        hasPinHash: !!signupPayload.pinHash,
        authMethodsCount: signupPayload.authMethods.length,
        verificationMethod: signupPayload.verificationMethod
      });
  
      console.log("--- Step 3: Registering User ---");
      
      // Use API utility function for signup
      const signupData = await signupUser(signupPayload);
      console.log("Signup Response:", signupData);
  
      // Save token and user data to store after successful signup
      if (signupData.data?.token) {
        setToken(signupData.data.token);
        console.log('✅ Token saved to store after signup');
      }
      
      if (signupData.data?.userId) {
        setUserId(signupData.data.userId);
        console.log('✅ User ID saved to store:', signupData.data.userId);
      }
      
      if (signupData.data?.userAddress) {
        setWalletAddress(signupData.data.userAddress);
        console.log('✅ Wallet address saved to store');
      }
      
      if (signupData.data?.authMethods) {
        setUserAuthMethods(signupData.data.authMethods);
        console.log('✅ Auth methods saved to store');
      }
  
      // STEP 4: Complete the refund flow after successful account creation
      console.log("--- Step 4: Completing Refund Flow ---");
      setCurrentDidImage(DidCreationImage3); 
      setProgressText('DID created. Initiating collateral refund...');
      setCurrentProgressImage(Progress70);
      
      setCurrentDidImage(DidCreationImage4);
      setProgressText('Refund of 2 ADA Collateral to the connected wallet is complete.');
      setCurrentProgressImage(Progress100);
      
      setTimeout(() => {
        console.log('✅ Account creation complete. Navigating to name setup...');
        router.push('/(auth)/sign-up/name');
      }, 2000); 
  
    } catch (error: unknown) {
      console.error("❌ Account creation error:", error);
      
      let errorMessage = 'An unexpected error occurred during account creation. Please try again.';
      
      if (error instanceof Error) {
        if (error.message?.includes('Network request failed')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message?.includes('encrypt') || error.message?.includes('hash')) {
          errorMessage = 'Security setup failed. Please try again.';
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
      setCurrentDidImage(DidCreationFailed);
      setCurrentProgressImage(ProgressFailed);
      setProgressText(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  

  const triggerImmediateRefund = async () => {
    console.log("--- Requesting Immediate Refund ---");
    setCurrentStep('refund');
    setIsLoading(true);
  
    try {
      const refundData = await completeRefund(sendingAddress, sendingAddress);
      console.log("Refund response:", refundData);
  
      setRefundStatus(prev => ({ ...prev, txHash: refundData?.txHash }));
      setCurrentDidImage(DidCreationImage4);
      setProgressText('Refund of 2 ADA Collateral to the connected wallet is complete.');
      setCurrentProgressImage(Progress100);
      
      setTimeout(() => {
        router.push('/(auth)/sign-up/name');
      }, 2000);
  
    } catch (error: any) {
      setError(`Refund error: ${error.message}`);
      setCurrentDidImage(DidCreationFailed);
      setCurrentProgressImage(ProgressFailed);
      setProgressText('Refund failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateZKProof = async () => {
    setCurrentStep('commitment');
    setIsLoading(true);

    try {
      const userId = generateUserId();
      const biometricData = "static_biometric_data_base64_encoded";
      const passkey = pin;
      
      // Use API utility functions
      console.log("Generating ZK commitment...");
      const commitment = await generateZKCommitment(phoneNumber, biometricData, passkey);
      zkCommitmentRef.current = commitment;
      console.log("ZK Commitment:", zkCommitmentRef.current);

      console.log("Generating ZK proof...");
      const proof = await generateZKProof(phoneNumber, biometricData, passkey, zkCommitmentRef.current);
      zkProofRef.current = proof;
      console.log("ZK Proof:", zkProofRef.current);
      
      setRetryData({
        userId,
        commitment: zkCommitmentRef.current,
        proof: zkProofRef.current
      });

      setShowConfirmationModal(false);
      setShowProgress(true);
      setCurrentDidImage(DidCreationImage1);
      setCurrentProgressImage(Progress30);
      setProgressText('DID creation in progress. Awaiting deposit verification and vault setup. Refund of collateral will proceed after DID is created.');

      setTimeout(() => {
        createAccountAndLogin(userId);
      }, 1000);

    } catch (error: any) {
      setError(`An unexpected error occurred during initial setup: ${error.message}`);
      setCurrentDidImage(DidCreationFailed);
      setCurrentProgressImage(ProgressFailed);
      setProgressText('Initial setup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAda = () => {
    setShowSendAdaModal(false);
    setShowConfirmationModal(true);
  };
  
  useEffect(() => {
    if (showConfirmationModal) {
      handleGenerateZKProof();
    }
  }, [showConfirmationModal]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const handleProceed = () => {
    setShowSendAdaModal(true);
  };

  const handleCopyAddress = () => {
    Clipboard.setString(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };


const { height: windowHeight } = useWindowDimensions();
const [keyboardHeight, setKeyboardHeight] = useState(0);

useEffect(() => {
  const show = Keyboard.addListener('keyboardDidShow', (e) => {
    setKeyboardHeight(e.endCoordinates.height - 300);
  });
  const hide = Keyboard.addListener('keyboardDidHide', () => {
    setKeyboardHeight(0);
  });
  return () => { show.remove(); hide.remove(); };
}, []);

  return (
    <View className="flex-1  px-5">
      <View className="relative flex-row items-center justify-start mb-12">
        <TouchableOpacity className="z-10" onPress={() => router.back()}>
        <BackIcon width={40} height={40} /> 
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

        <View className="items-center mb-4">
          <Image 
            source={currentDidImage} 
            className="w-80 h-12 mb-4"
          />
        </View>

        {showProgress && (
          <View className="items-center mt-12">
            <Image 
              source={currentProgressImage} 
              className="w-52 h-52 mb-4" 
              resizeMode="contain" 
            />
            <Text className={`text-center font-sora text-sm mb-4 ${error ? 'text-red-500' : 'text-main'}`}>
              {progressText}
            </Text>
            
            {error && (
              <Button
                text="Try Again"
                onPress={handleRetry}
                outline
              />
            )}
            
            {refundStatus.txHash && (
              <Text className="text-green-500 mt-2 font-sora text-xs">
                Refund TX: {refundStatus.txHash.slice(0, 12)}...{refundStatus.txHash.slice(-6)}
              </Text>
            )}
          </View>
        )}
      </View>

      {!showProgress && (
        <View className='mb-16'>
          <Text className="text-main font-sora text-xs text-center mb-4">
            Note: 
            <Text className="text-neutral100"> Collateral will be fully refunded upon completion of vault setup</Text>
          </Text>
          <Button
            text='Deposit 2ADA'
            onPress={handleProceed}
          />
        </View>
      )}

      {/* Send ADA Modal */}
{/* Send ADA Modal */}
<Modal
  visible={showSendAdaModal}
  animationType="slide"
  transparent={true}
  onRequestClose={() => {
    Keyboard.dismiss();
    setShowSendAdaModal(false);
  }}
>
  <TouchableWithoutFeedback
    onPress={() => {
      Keyboard.dismiss();
      setShowSendAdaModal(false);
    }}
  >
    <View className="flex-1 bg-neutral800/90 justify-end">

      {/* Keyboard handling container */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ maxHeight: "90%" }}
      >

        <TouchableWithoutFeedback>
          <View className="bg-mainBlack rounded-t-3xl px-6">

            {/* Drag handle */}
            <TouchableOpacity
              className="items-center pt-3 pb-6"
              onPress={() => setShowSendAdaModal(false)}
            >
              <View className="w-16 h-1 bg-white rounded-full" />
            </TouchableOpacity>

            <ScrollView
            ref={scrollRef}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >

              <Text className="text-white font-sora-bold text-lg text-center mb-6">
                Send 2 ADA
              </Text>

              {/* QR */}
              <View className="items-center mb-6">
                <Image
                  source={QRCodeImage}
                  resizeMode="contain"
                  className="w-32 h-32"
                />
              </View>

              <Text className="text-neutral200 font-sora text-xs text-center mb-6 px-20">
                Scan QR code with camera to send 2ADA
              </Text>

              {/* Divider */}
              <View className="flex-row w-full mb-6 overflow-hidden">
                {[...Array(100)].map((_, i) => (
                  <View
                    key={i}
                    className="h-px w-[.5px] bg-neutral200 mx-0.5"
                  />
                ))}
              </View>

              {/* Wallet Address */}
              <Text
                style={{ letterSpacing: 0.78 }}
                className="text-white text-xs text-center font-space-mono mb-4 px-5 leading-relaxed break-words max-w-[300px] mx-auto"
                numberOfLines={3}
              >
                {walletAddress}
              </Text>

              {/* Copy */}
              <TouchableOpacity
                className="flex-row items-center justify-center mb-8"
                onPress={handleCopyAddress}
              >
                {copied ? (
                  <Ionicons name="checkmark" size={16} color="#FFD939" />
                ) : (
                  <Image
                    source={CopyIcon}
                    className="w-5 h-5 mr-2"
                    resizeMode="contain"
                  />
                )}

                <Text
                  className={`font-sora text-sm ml-2 ${
                    copied ? "text-main" : "text-neutral200"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </Text>
              </TouchableOpacity>

              {/* INPUT */}
              <View className="mb-8 w-full mt-5">

                <Text className="text-white font-sora text-sm mb-3">
                  Your sending address
                </Text>

                <View className="flex-row items-center border border-neutral200 rounded-md px-4 h-14">

                  <TextInput
                    value={sendingAddress}
                    onChangeText={setSendingAddress}
                    placeholder="Paste sending address"
                    placeholderTextColor="#888"
                    className="flex-1 text-white font-sora text-sm"
                  />

                  <TouchableOpacity
                    onPress={async () => {
                      const text = await Clipboard.getString();
                      setSendingAddress(text);
                    }}
                  >
                    <Image
                      source={InputEndIcon}
                      className="w-5 h-5"
                      resizeMode="contain"
                    />
                  </TouchableOpacity>

                </View>
              </View>

              {/* Continue */}
              <View className={keyboardVisible ? "mb-96" : "mb-6"}>
  <Button
    text="Continue"
    onPress={handleSendAda}
  />
</View>

            </ScrollView>
          </View>
        </TouchableWithoutFeedback>

      </KeyboardAvoidingView>

    </View>
  </TouchableWithoutFeedback>
</Modal>


      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        animationType="slide"
        transparent={true}
        //onRequestClose={() => setShowConfirmationModal(false)}
      >
        <TouchableWithoutFeedback onPress={() => {}}>
          <View className="flex-1 bg-[#0a0a0a]/90 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-[#1a1a1a] rounded-t-3xl px-6 pb-16">
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
                  A collateral of 2 ADA is required to verify your account setup.
                  </Text>
                </View>

                <View className="items-center px-6 my-16">
                  <Image 
                    source={DidCreationImage1} 
                    className="w-full" 
                    resizeMode="contain" 
                  />
                </View>
                
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