exports.newNetworkModulesP2PNetworkPeers = function newNetworkModulesP2PNetworkPeers() {
    /*
    This module represents the P2P Nodes we are connected to.
    */
    let thisObject = {
        peers: undefined,

        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    const RECONNECT_DELAY = 10 * 1000
    let intervalIdConnectToPeers

    return thisObject

    function finalize() {
        thisObject.peers = undefined
        clearInterval(intervalIdConnectToPeers)
    }

    async function initialize() {

        thisObject.peers = []

        connectToPeers()
        intervalIdConnectToPeers = setInterval(connectToPeers, RECONNECT_DELAY);

    }

    async function connectToPeers() {

        if (thisObject.peers.count >= global.env.P2P_NETWORK_NODE_MAX_OUTGOING_PEERS) { return }

        for (let i = 0; i < NT.networkNode.p2pNetwork.p2pNodesToConnect.length; i++) {
            if (thisObject.peers.count >= global.env.P2P_NETWORK_NODE_MAX_OUTGOING_PEERS) { break }
            let peer = {}
            peer.p2pNetworkNode = NT.networkNode.p2pNetwork.p2pNodesToConnect[i]
            if (isAlreadyAConnectedPeer(peer) === true) { continue }
            peer.webSocketsClient = SA.projects.network.modules.webSocketsNetworkClient.newNetworkModulesWebSocketsNetworkClient()
            await peer.webSocketsClient.initialize('Network Peer', peer.p2pNetworkNode)
                .then(addPeer)
                .catch(onError)

            function addPeer() {
                thisObject.peers.push(peer)
            }

            function onError(err) {
                if (err !== undefined) {
                    console.log('[ERROR] P2P Network Peers -> onError -> While connecting to node -> ' + peer.p2pNetworkNode.userProfile.userProfileHandle + ' -> ' + peer.p2pNetworkNode.node.name + ' -> ' + err.message)
                } else {
                    console.log('[WARN] P2P Network Peers -> onError -> Peer Not Available at the Moment -> ' + peer.p2pNetworkNode.userProfile.userProfileHandle + ' -> ' + peer.p2pNetworkNode.node.name)
                }
            }
        }

        function isAlreadyAConnectedPeer(peer) {
            for (let i = 0; i < thisObject.peers.length; i++) {
                let connectedPeer = thisObject.peers[i]
                if (connectedPeer.p2pNetworkNode.node.id === peer.p2pNetworkNode.node.id) {
                    return true
                }
            }
        }
    }
}