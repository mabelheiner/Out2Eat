import { StyleSheet, Text, View, Image, Linking } from 'react-native'
import React, { useEffect, useState } from 'react'

const logoPlaceholder = require("../assets/images/logoPlaceholder.jpg")

interface Restaurant {
    id: number;
    name: string;
    address: string;
    lat: number;
    lon: number;
    googleMapsLink: string;
    logoUrl: string; // Logo URL is required
}

interface PlaceProps {
    restaurant: Restaurant
}

const Place: React.FC<PlaceProps> = ({ restaurant }) => {
  const [imageSource, setImageSource] = useState<{ uri: string }>({ uri: restaurant.logoUrl }) || logoPlaceholder;

  useEffect(() => {
    setImageSource({uri: restaurant.logoUrl})
  }, [restaurant])
  const handleImageError = () => {
    console.log(`Failed to load image: ${restaurant.logoUrl}, falling back to placeholder`);
    setImageSource(logoPlaceholder);
  };

  return (
    <View>
      <Text style={styles.restaurantName}>
        {restaurant.name}
      </Text>
      <Image
        source={imageSource}
        style={styles.image}
        onError={(handleImageError)}
      />
      {/* {restaurant.address != "No street address available" ? (
        <Text
        style={{ color: "blue" }}
        onPress={() => Linking.openURL(restaurant.googleMapsLink)}
      >
        View on Google Maps
      </Text>
      ): (<Text>No street address available</Text>)} */}
    </View>
  );
};

const styles = StyleSheet.create({
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  image: {
    width: 200,
    height: 200,
    marginVertical: 16,
    borderRadius: 8,
  },
});

export default Place;
