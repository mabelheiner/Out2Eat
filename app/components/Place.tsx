import { StyleSheet, Text, View, Image, ScrollView } from 'react-native'
import React, { useState } from 'react'

const logoPlaceholder = require("../assets/images/logoPlaceholder.jpg")

interface Restaurant {
    id: number;
    name: string;
    address: string;
    lat: number;
    lon: number;
    googleMapsLink: string;
    logoUrl?: string; // Logo URL is optional
}

interface PlaceProps {
    restaurant: Restaurant
}

const Place: React.FC<PlaceProps> = ({restaurant}) => {
  return (
    <ScrollView>
      <Text>
        {restaurant.name}
      </Text>
        {restaurant.logoUrl ? (
          <>
          <Image source={{ uri: restaurant.logoUrl }} alt={restaurant.logoUrl} onError={(error) => console.log('Error', error)} />
          <Text>{restaurant.logoUrl}</Text>
          </>
          ) : (
          <Image source={logoPlaceholder} alt={"no logo found"} />
        )}
        
    </ScrollView>
  )
}

export default Place

const styles = StyleSheet.create({})