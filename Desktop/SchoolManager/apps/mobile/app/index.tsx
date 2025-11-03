import { View, StyleSheet } from 'react-native'
import { Text, Card } from 'react-native-paper'

export default function Index() {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineLarge" style={styles.title}>
            SAR Educational Complex
          </Text>
          <Text variant="titleMedium" style={styles.subtitle}>
            School Management System
          </Text>
          <Text variant="bodySmall" style={styles.address}>
            Sepe Dote near Hospital Junction{'\n'}
            Asokore Mampong District, Kumasi, Ghana
          </Text>
        </Card.Content>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  card: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    textAlign: 'center',
    color: '#0284c7',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  address: {
    textAlign: 'center',
    color: '#999',
  },
})
