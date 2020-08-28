import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 80
    },
    title: {
        fontWeight: '800',
        fontSize: 18
    },
    eventContainer: {
        alignItems: 'center',
        marginBottom: 80
    },
    eventTitle: {
        fontSize: 14,
        letterSpacing: 0.2,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
        color: 'dimgray'
    },
    eventNameContainer: {
        marginBottom: 40
    },
    eventName: {
        fontSize: 22,
        textAlign: 'center'
    },
    eventDataContainer: {
        maxHeight: 200,
        maxWidth: 320
    },
    button: {
        width: 200,
        height: 50,
        backgroundColor: 'tomato'
    },
    textInput: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        padding: 2,
        marginBottom: 20
    },
    tempoWrapper: {
        marginTop: 20,
    }
});

export default styles