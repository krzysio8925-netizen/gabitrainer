import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

/**
 * Lets the client pick a body photo and shrinks it to ~900 px wide JPEG,
 * small enough (≈100–200 KB) to store with the report. Returns a data URI, or null if cancelled.
 */
export async function pickBodyPhoto(): Promise<string | null> {
  const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [3, 4], quality: 1 });
  if (res.canceled) return null;
  const rendered = await ImageManipulator.manipulate(res.assets[0].uri).resize({ width: 900 }).renderAsync();
  const saved = await rendered.saveAsync({ compress: 0.7, format: SaveFormat.JPEG, base64: true });
  return saved.base64 ? `data:image/jpeg;base64,${saved.base64}` : null;
}
