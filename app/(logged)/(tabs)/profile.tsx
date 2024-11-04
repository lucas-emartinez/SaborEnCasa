import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import React from 'react'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useData } from '@/context/DataProvider';
import { envConfig } from '@/configs/envConfig';

export default function profile() {
  const { user } = useData();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <Text style={styles.title}>Mi perfil</Text>
      </View>
      <View style={styles.profileInfo}>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom:10 }}>
              {user && <Image source={{ uri: `${envConfig.IMAGE_SERVER_URL}/users/${user.image}` }} style={styles.avatar} />}
              <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom:10  }}>
              <Text style={styles.configs}>Configuracion</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom:10  }}>
              <Text style={styles.configs}>Editar datos personales</Text>
          </View>
      </View>
      <View style={styles.healthInfo}>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom:10  }}>
              <Text style={styles.configs}>Preferencias</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom:10  }}>
              <Text style={styles.configs}>Restricciones Alimentarias</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom:10  }}>
              <Text style={styles.configs}>Dietas</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center', marginBottom:10  }}>
              <Text style={styles.configs}>Tips nutricionales</Text>
          </View>
      </View>
      <Text>Acerca de la aplicacion</Text>
      <Text>Terminos y condiciones</Text>

      
    </View>


  )
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 15,
      backgroundColor: '#fff',
  },
  scrollView: {
      flex: 1,
  },
  scrollViewContent: {
      paddingBottom: 80, // Add extra padding to ensure content is not hidden behind the button
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
  },
  profileInfo: {
    marginTop:30,
    borderRadius: 20,
    backgroundColor:'#F2F2F2',
    padding:20,
  },
  healthInfo: {
    marginTop:20,
    marginBottom:10,
    borderRadius: 20,
    backgroundColor:'#cbe7cb',
    padding:20,
  },
  userName: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  configs: {
    fontSize: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor:'white',
  },
})