import { usePhoneStore } from '@/store/usePhoneStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import { decryptPhrases } from '@/utils/crypto';
import BackButton from '../../../assets/images/back.png';
import ArrowLeft from '../../../assets/images/left.png';
import ArrowRight from '../../../assets/images/right.png';

export default function ViewKey() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { phoneNumber } = usePhoneStore();

  const [phrases, setPhrases] = useState<string[]>([]);
  const [page, setPage] = useState<1 | 2>(1);
const [keyCount, setKeyCount] = useState<string>('');
  const totalPages = keyCount === '12' ? 1 : 2;
  const isFirstPage = page === 1;
  const isLastPage = page === totalPages;

  useEffect(() => {
    const loadPhrases = async () => {
      try {
        const SEPARATOR = '|||';
        const encryptedPayload = params?.phrases as string;

        const [encryptedPhrases, encryptedMeta] = encryptedPayload.split(SEPARATOR);

const decryptedPhrases = await decryptPhrases(encryptedPhrases, phoneNumber);
const phrasesArray = decryptedPhrases.split(SEPARATOR);

const decryptedMeta = await decryptPhrases(encryptedMeta, phoneNumber);
const keyCount = decryptedMeta.slice(0, 2); 
setKeyCount(keyCount);
const walletName = decryptedMeta.slice(2);
        setPhrases(phrasesArray);
      } catch (err) {
        console.error('Decryption error:', err);
      }
    };

    loadPhrases();
  }, [params, phoneNumber]);

  const getStartEndIndex = () => {
    if (keyCount === '12') return [0, 12];
    return page === 1 ? [0, 12] : [12, 24];
  };

  const [start, end] = getStartEndIndex();

  const renderPhraseBoxes = (start: number, end: number) => {
    const boxes = [];
    for (let i = start; i < end; i += 2) {
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

  return (
    <View className="flex-1 bg-neutral800 px-5 pt-12">
      {/* Header */}
      <View className="relative flex-row items-center justify-start mb-6">
        <TouchableOpacity className="z-10" onPress={() => router.back()}>
          <Image source={BackButton} className="w-10 h-10" resizeMode="contain" />
        </TouchableOpacity>
      </View>

      {/* Phrase Display */}
      <Text className="text-white font-sora text-2xl">{keyCount}</Text>
      <ScrollView className="my-5">
        <View className="bg-white/10 rounded-xl pt-4">
          {renderPhraseBoxes(start, end)}
        </View>

        {/* Page Nav if 24 words */}
        {keyCount === '24' && (
          <View className="flex-row items-center justify-between mt-10 px-4">
            <TouchableOpacity onPress={() => setPage(page - 1)} disabled={isFirstPage}>
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

            <TouchableOpacity onPress={() => setPage(page + 1)} disabled={isLastPage}>
              <Image source={ArrowRight} style={{ opacity: isLastPage ? 0.5 : 1 }} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
