// components/AddKey.tsx
import Button from '@/components/Button';
import { usePhoneStore } from '@/store/usePhoneStore';
import { useVaultStore } from '@/store/useVaultStore';
import { encryptPhrases } from '@/utils/crypto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import BackButton from '../../../assets/images/back.png';
import ArrowLeft from '../../../assets/images/left.png';
import ArrowRight from '../../../assets/images/right.png';
export default function AddKey() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedKeyType, setSelectedKeyType] = useState<'12' | '24'>('12');
  const [phrases, setPhrases] = useState<string[]>(Array(24).fill(''));
  const [focusedInput, setFocusedInput] = useState<number | null>(null);
  const [page, setPage] = useState<1 | 2>(1);

  const { phoneNumber } = usePhoneStore()

  const totalPages = selectedKeyType === '12' ? 1 : 2;
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  const handlePhraseChange = (text: string, index: number) => {
    const newPhrases = [...phrases];
    newPhrases[index] = text;
    setPhrases(newPhrases);
  };

  const { setFileId, fileId } = useVaultStore();


  const renderPhraseInputs = (start: number, end: number) => {
    const inputs = [];
    for (let i = start; i < end; i += 2) {
      inputs.push(
        <View key={`row-${i}`} className="flex-row justify-center mb-6">
          {[i, i + 1].map((index) => (
            <TextInput
              key={`phrase-${index}`}
              className={`w-[45%] h-14 rounded-lg p-4 mx-2 text-center font-sora ${
                focusedInput === index || phrases[index]
                  ? 'bg-white text-black'
                  : 'bg-neutral300 text-neutral50'
              }`}
              placeholder={`Phrase ${index + 1}`}
              placeholderTextColor="#B0B0B0"
              value={phrases[index]}
              onChangeText={(text) => handlePhraseChange(text, index)}
              onFocus={() => setFocusedInput(index)}
              onBlur={() => setFocusedInput(null)}
              keyboardAppearance="dark"
            />
          ))}
        </View>
      );
    }
    return inputs;
  };

  const goToPrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const goToNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const getStartEndIndex = () => {
    if (selectedKeyType === '12') return [0, 12];
    return page === 1 ? [0, 12] : [12, 24];
  };

  const [start, end] = getStartEndIndex();

  const allPhrasesFilled = selectedKeyType === '12' 
    ? phrases.slice(0, 12).every(p => p.trim())
    : phrases.every(p => p.trim());

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-neutral800 px-5 pt-12"
      >
        {/* Header */}
        <View className="relative flex-row items-center justify-start mb-6">
          <TouchableOpacity className="z-10" onPress={() => router.back()}>
            <Image
              source={BackButton}
              className="w-10 h-10"
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Key Type Selector */}
        <View className="flex-row mb-8 mt-3">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ${
              selectedKeyType === '12' ? 'bg-white' : ''
            }`}
            onPress={() => {
              setSelectedKeyType('12');
              setPage(1);
            }}
          >
            <Text
              className={`text-center font-sora ${
                selectedKeyType === '12'
                  ? 'text-black font-sora-semibold'
                  : 'text-neutral200'
              }`}
            >
              12 Keys
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ${
              selectedKeyType === '24' ? 'bg-white' : ''
            }`}
            onPress={() => {
              setSelectedKeyType('24');
              setPage(1);
            }}
          >
            <Text
              className={`text-center font-sora ${
                selectedKeyType === '24'
                  ? 'text-black font-sora-semibold'
                  : 'text-neutral200'
              }`}
            >
              24 Keys
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phrase Inputs */}
        <ScrollView className="my-5">
          <View className="bg-white/10 rounded-xl pt-4">
            {renderPhraseInputs(start, end)}
          </View>
          
          {/* Navigation Controls */}
          {selectedKeyType === '24' && (
            <View className="flex-row items-center justify-between mt-10 px-4">
              <TouchableOpacity 
                onPress={goToPrevPage}
                disabled={isFirstPage}
              >
                <Image 
                  source={ArrowLeft} 
                  style={{ opacity: isFirstPage ? 0.5 : 1 }}
                />
              </TouchableOpacity>

              <View className="flex-row gap-3 items-center">
                {[...Array(totalPages)].map((_, index) => (
                  <View
                    key={index}
                    className={`rounded-full ${
                      page === index + 1
                        ? 'bg-white w-4 h-2'
                        : 'bg-neutral100 w-2 h-2'
                    }`}
                  />
                ))}
              </View>

              <TouchableOpacity 
                onPress={goToNextPage}
                disabled={isLastPage}
              >
                <Image 
                  source={ArrowRight} 
                  style={{ opacity: isLastPage ? 0.5 : 1 }}
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Continue Button */}
        <View className="pb-8">
        <Button
          text="Done"
          onPress={async () => {
            try {
              const phrasesToLog = selectedKeyType === '12' 
                ? phrases.slice(0, 12) 
                : phrases.slice(0, 24);
              
              const SEPARATOR = '|||';
              const phrasesString = phrasesToLog.join(SEPARATOR);
              console.log('Phrases:', phrasesString);

              const encryptedPhrases = await encryptPhrases(phrasesString, phoneNumber);
              console.log('Encrypted Phrases:', encryptedPhrases);

              const metaString = `${selectedKeyType}${params.walletName}`;
              const encryptedMeta = await encryptPhrases(metaString, phoneNumber);
              const finalEncrypted = `${encryptedPhrases}${SEPARATOR}${encryptedMeta}`;

              // First wait for the API call to complete
              const response = await fetch('https://k33p-backend.onrender.com/api/v1/vault/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ encrypted_seed_phrase: finalEncrypted }),
              });
            
              if (!response.ok) {
                throw new Error(`Failed to save to vault: ${response.status}`);
              }
            
              const result = await response.json();
              const fileId = result?.data?.file_id;
              console.log('Saved with File ID:', fileId);
            
              if (!fileId) {
                throw new Error('No file ID received from server');
              }

              // Update the store with the new fileId
              setFileId(fileId);

              // Only navigate after we have the fileId
              router.push({
                pathname: '/(home)/add-to-wallet',
                params: { 
                  updatedWallet: JSON.stringify({
                    id: params.walletId,
                    name: params.walletName,
                    keyType: selectedKeyType,
                    fileId: fileId // Use the local fileId from response
                  })
                }
              });
              
            } catch (err) {
              console.error('Error:', err);
              Alert.alert('Error', 'Failed to save wallet. Please try again.');
            }
          }}
          isDisabled={!allPhrasesFilled}
        />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}