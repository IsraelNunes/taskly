import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { NewsSummary } from '../types/news';
import { colors, spacing } from '../theme';

type NewsCardProps = {
  item: NewsSummary;
  onPress: () => void;
};

export function NewsCard({ item, onPress }: NewsCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {item.imagem ? <Image source={{ uri: item.imagem }} style={styles.image} /> : null}
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.author}>{item.autorNome}</Text>
          <Text style={[styles.badge, item.status === 'PUBLICADO' ? styles.published : styles.draft]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.title}>{item.titulo}</Text>
        <Text style={styles.summary} numberOfLines={3}>
          {item.resumo}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  image: {
    height: 140,
    width: '100%',
  },
  content: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  badge: {
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 99,
  },
  published: {
    backgroundColor: '#E6F6EE',
    color: colors.success,
  },
  draft: {
    backgroundColor: '#FFF2E8',
    color: colors.primary,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  summary: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
