import React, { useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, Linking, Image, Platform } from "react-native";
import axios from "axios";
import Place from "./components/Place";

//const logoPlaceholder = require('../assets/images/logoPlaceholder.jpg')

interface Restaurant {
  id: number;
  name: string;
  address: string;
  lat: number;
  lon: number;
  googleMapsLink: string;
  logoUrl?: string; // Logo URL is optional
}

export default function Index() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const generateGoogleMapsLink = (name: string, lat: number, lon: number) => {
    const formattedName = encodeURIComponent(name);
    return `https://www.google.com/maps/search/${formattedName}/@${lat},${lon},17z`;
  };

  const fetchLogos = async (brandWikidata: string | undefined, website: string | undefined): Promise<string | undefined> => {

    if (brandWikidata && Platform.OS != 'android') {
      try {
        const wikidataUrl = `https://www.wikidata.org/wiki/Special:EntityData/${brandWikidata}.json`;      
        const response = await axios.get(wikidataUrl);
        const claims = response.data.entities[brandWikidata]?.claims;
        const logoClaim = claims?.["P154"]; // Wikidata property for logo
        const logoUrl = logoClaim?.[0]?.mainsnak?.datavalue?.value;

        if (logoUrl) {
          return `https://commons.wikimedia.org/wiki/Special:FilePath/${logoUrl}`;
        }
      } catch (error) {
        
      }
    } 

    if (website && Platform.OS !== 'web') {
      try {
        const kickfireUrl = `https://api.kickfire.com/logo?website=${website}.com`;
        const response = await axios.get(kickfireUrl);

        if (response?.status === 200) {
          return response?.config?.url;
        }
      } catch (error) {
      
      }
    }

    return undefined;
  }

  const fetchRestaurants = async () => {
    setLoading(true);

    const query = `
      [out:json];
      area["name"="Rexburg"]->.searchArea;
      nwr["amenity"="fast_food"](area.searchArea);
      out geom;
    `;
    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(url);
      const data = response.data.elements;
      console.log('Data', data)

      const formattedData: Restaurant[] = await Promise.all(
        data.map(async (item: any) => {
          const addressParts: string[] = [];

          if (
            item.tags["addr:housenumber"] &&
            item.tags["addr:street"] &&
            item.tags["addr:city"] &&
            item.tags["addr:state"] &&
            item.tags["addr:postcode"]
          ) {
            addressParts.push(item.tags["addr:housenumber"]);
            addressParts.push(`${item.tags["addr:street"]},`);
            addressParts.push(item.tags["addr:city"]);
            addressParts.push(item.tags["addr:state"]);
            addressParts.push(item.tags["addr:postcode"]);
          }

          const address = addressParts.join(" ") || "No street address available";
          const googleMapsLink = generateGoogleMapsLink(item.tags?.name || "Unnamed", item.lat, item.lon);

          const formattedName = item.tags?.name
            ?.toLowerCase()
            .replace(/\s+/g, "") // Remove spaces
            .replace(/'/g, ""); // Remove apostrophes
          const logoUrl = await fetchLogos(item.tags?.["brand:wikidata"], formattedName);
          console.log(`logo url for ${formattedName} is ${logoUrl}`)

          return {
            id: item.id,
            name: item.tags?.name || "Unnamed",
            address: address,
            lat: item.lat,
            lon: item.lon,
            googleMapsLink: googleMapsLink,
            logoUrl: logoUrl,
          };
        })
      );

      setRestaurants(formattedData);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Fetch Restaurants" onPress={fetchRestaurants} />
      {loading ? (
        <Text>Loading...</Text>
      ) : restaurants.length === 0 ? (
        <Text>No restaurants found.</Text>
      ) : (
        <View>
          {restaurants.map((restaurant, index) => (
            <Place key={index} restaurant={restaurant} />
          ))}          
        </View> 
        )}
        </View>
      );
    }
        {/* <FlatList
          data={restaurants}
          keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
          renderItem={({ item }) => (
            <View style={styles.item}>
              {item.logoUrl ? (
                <Image source={{ uri: item.logoUrl }} style={styles.logo} alt={item.logoUrl} onError={() => console.log('image error')}/>
              ) : (
                <View>
                  <Image source={logoPlaceholder} style={styles.logo} alt={item.logoUrl} />
                </View>
              )}
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.address}>{item.address}</Text>
              <Text style={styles.link}>
                <Text
                  style={{ color: "blue" }}
                  onPress={() => Linking.openURL(item.googleMapsLink)}
                >
                  View on Google Maps
                </Text>
              </Text>
            </View>
          )}
        />
      )}
    </View> */}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  item: { marginBottom: 20, borderBottomWidth: 1, borderBottomColor: "#ccc", paddingBottom: 10 },
  name: { fontSize: 18, fontWeight: "bold" },
  address: { fontSize: 14, color: "#666" },
  link: { fontSize: 12, color: "blue" },
  logo: { height: 150, width: 150, marginBottom: 10, resizeMode: 'contain' },
});
