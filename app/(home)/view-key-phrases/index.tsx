// screens/(home)/view-key-phrases.tsx

import { usePhoneStore } from '@/store/usePhoneStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { decryptPhrases } from '@/utils/crypto'; // Ensure this utility is correct and available
import BackButton from '../../../assets/images/back.png';
import ArrowLeft from '../../../assets/images/left.png';
import ArrowRight from '../../../assets/images/right.png';

interface VaultRetrieveResponse {
  status: string;
  message: string;
  data: {
    encrypted_seed_phrase: string;
  };
}

export default function ViewKey() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { phoneNumber } = usePhoneStore();

  const [phrases, setPhrases] = useState<string[]>([]);
  const [page, setPage] = useState<1 | 2>(1);
  const [keyCount, setKeyCount] = useState<string>(''); // Will be '12' or '24'
  const [walletName, setWalletName] = useState<string>('Wallet'); // To be derived from decrypted metadata
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const totalPages = keyCount === '12' ? 1 : 2;
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  useEffect(() => {
    const fileId = params?.fileId as string;

    if (!fileId) {
      setError('File ID not provided in navigation parameters.');
      setLoading(false);
      return;
    }

    if (!phoneNumber) {
      setError('Phone number not available for decryption. Please log in.');
      setLoading(false);
      return;
    }

    const retrieveAndDecrypt = async () => {
      setLoading(true);
      setError(null);
      try {
        // Step 1: Retrieve encrypted string from backend using file_id
        const response = await fetch('https://k33p-backend.onrender.com/api/v1/vault/retrive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ file_id: fileId }),
        });

        const data: VaultRetrieveResponse = await response.json();

        if (response.ok && data.status === 'success') {
          const encryptedSeedPhrase = data.data.encrypted_seed_phrase;

          // Step 2: Decrypt the phrases and metadata
          const SEPARATOR = '|||';
          // Assuming the encrypted string is in the format "encryptedPhrases|||encryptedMeta"
          // where encryptedMeta contains keyCount (e.g., '12' or '24') and walletName.
          const [encryptedPhrasesPart, encryptedMetaPart] = encryptedSeedPhrase.split(SEPARATOR);

          if (!encryptedPhrasesPart || !encryptedMetaPart) {
            throw new Error("Invalid encrypted payload format. Missing separator.");
          }

          const decryptedPhrasesString = await decryptPhrases(encryptedPhrasesPart, phoneNumber);
          const phrasesArray = decryptedPhrasesString.split(SEPARATOR); // Split phrases by separator

          const decryptedMetaString = await decryptPhrases(encryptedMetaPart, phoneNumber);
          const extractedKeyCount = decryptedMetaString.slice(0, 2); // First two chars are key count
          const extractedWalletName = decryptedMetaString.slice(2); // Rest is wallet name

          setKeyCount(extractedKeyCount);
          setWalletName(extractedWalletName);
          setPhrases(phrasesArray);
          console.log('Successfully retrieved and decrypted phrases.');
        } else {
          // Handle API errors (e.g., file_id not found)
          throw new Error(data.message || `API error: ${response.status}`);
        }
      } catch (err) {
        console.error('Error in retrieveAndDecrypt:', err);
        setError(`Failed to load key phrases: ${err instanceof Error ? err.message : String(err)}`);
        Alert.alert("Error", `Failed to load key phrases. Please ensure the wallet is properly synced and try again.`);
      } finally {
        setLoading(false);
      }
    };

    retrieveAndDecrypt();
  }, [params.fileId, phoneNumber]); // Depend on fileId and phoneNumber

  const getStartEndIndex = () => {
    if (keyCount === '12') {
      return [0, 12];
    } else { // Assumed '24' if not '12'
      return page === 1 ? [0, 12] : [12, 24];
    }
  };

  const [start, end] = getStartEndIndex();

  const renderPhraseBoxes = (startIndex: number, endIndex: number) => {
    const boxes = [];
    for (let i = startIndex; i < endIndex; i += 2) {
      boxes.push(
        <View key={`row-${i}`} className="flex-row justify-center mb-6">
          {[i, i + 1].map((index) => (
            <View
              key={`phrase-${index}`}
              className="w-[45%] h-14 rounded-lg p-4 mx-2 justify-center items-center bg-white"
            >
              <Text className="text-black font-sora">{phrases[index]}</Text>
            </View>
          ))}
        </View>
      );
    }
    return boxes;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-neutral800 justify-center items-center">
        <ActivityIndicator size="large" color="#FFD700" />
        <Text className="text-white mt-4">Loading key phrases...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-neutral800 justify-center items-center px-5">
        <Text className="text-red-500 text-center text-lg">{error}</Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} className="mt-8 bg-blue-500 p-3 rounded-lg">
          <Text className="text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral800 px-5 pt-12">
      {/* Header */}
      <View className="relative flex-row items-center justify-start mb-6">
        <TouchableOpacity className="z-10" onPress={() => router.back()}>
          <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Wallet Name and Key Count */}
      <Text className="text-white font-sora text-2xl mb-2">{walletName}</Text>
      <Text className="text-neutral400 font-sora text-lg mb-6">{keyCount} Keys</Text>

      {/* Phrase Display */}
      <ScrollView className="my-5">
        <View className="bg-white/10 rounded-xl pt-4">
          {phrases.length > 0 ? renderPhraseBoxes(start, end) : (
            <Text className="text-white text-center p-4">No phrases found for this wallet.</Text>
          )}
        </View>

        {/* Page Navigation for 24 words */}
        {keyCount === '24' && (
          <View className="flex-row items-center justify-between mt-10 px-4">
            <TouchableOpacity onPress={() => setPage(1)} disabled={isFirstPage}>
              <Image source={ArrowLeft} style={{ opacity: isFirstPage ? 0.5 : 1 }} />
            </TouchableOpacity>

            <View className="flex-row gap-3 items-center">
              {[...Array(totalPages)].map((_, index) => (
                <View
                  key={index}
                  className={`rounded-full ${
                    page === index + 1 ? 'bg-white w-4 h-2' : 'bg-neutral100 w-2 h-2'
                  }`}
                />
              ))}
            </View>

            <TouchableOpacity onPress={() => setPage(2)} disabled={isLastPage}>
              <Image source={ArrowRight} style={{ opacity: isLastPage ? 0.5 : 1 }} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}