import React, { useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from "react-native";

const numColumns = 3;

const ProductGrid = ({ products, onProductPress }) => {
  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const itemWidth = containerWidth / numColumns;
  const itemHeight = (itemWidth * 5) / 3;

  const renderProductItem = ({ item }) => (
    <TouchableOpacity style={[styles.itemContainer, { width: itemWidth, height: itemHeight }]} onPress={() => onProductPress(item)}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.gridWrapper} onLayout={handleLayout}>
      {containerWidth > 0 && (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.productId}
          numColumns={numColumns}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    padding: 4, 
    alignItems: "center",
    justifyContent: "center",
  },
  productImage: {
    width: "100%",
    height: "70%",
    resizeMode: "contain",
  },
  productTitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#007AFF",
    marginTop: 2,
  },
});

export default ProductGrid;
