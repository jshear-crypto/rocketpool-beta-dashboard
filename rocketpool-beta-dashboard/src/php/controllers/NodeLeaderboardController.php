<?php

// HTTP Status Codes
$HTTP_OK = 200;
$HTTP_BAD_REQUEST = 400;
$HTTP_UNAUTHORIZED = 401;
$HTTP_NOT_FOUND = 404;
$HTTP_INTERNAL_SERVER_ERROR = 500;

$NODE_FILE = '../assets/nodes.json';
$ADMIN_FILE = '../assets/admin.txt';

$routes = array(
    'getNodes' => 'getNodes',
    'setNodes' => 'setNodes'
);

// Response helpers
function sendError($status, $message) {
    echo json_encode(array(
        'status' => $status,
        'message' => $message,
        'data' => null
    ));
}

function sendResponse($data) {
    echo json_encode(array(
        'status' => $GLOBALS['HTTP_OK'],
        'message' => 'success',
        'data' => $data
    ));
}

function authorize($password) {
    return password_verify($password, file_get_contents($GLOBALS['ADMIN_FILE']));
}

function getNodes() {
    $json = file_get_contents($GLOBALS['NODE_FILE']);
    $node_update = json_decode($json, true);
    sendResponse($node_update);
}

function setNodes() {
    if (!isset($_REQUEST['auth']) || !authorize($_REQUEST['auth'])) {
        sendError($GLOBALS['HTTP_UNAUTHORIZED'], 'Unauthorized');
        return;
    }
    $node_update_array = array(
        'time' => time(),
        'nodes' => $_REQUEST['nodes']
    );
    $node_update = json_encode($node_update_array);
    if (!$node_update) {
        sendError($GLOBALS['HTTP_BAD_REQUEST'], 'Invalid node JSON');
        return;
    }
    if (file_put_contents($GLOBALS['NODE_FILE'], $node_update)) {
        sendResponse(null);
        return;
    }
    sendError($GLOBALS['HTTP_INTERNAL_SERVER_ERROR'], 'Failed to update nodes');
}

// If this is a post request, need to do a workaround to get JSON
if (strcmp($_SERVER['REQUEST_METHOD'], 'POST') === 0) {
    $json_input = file_get_contents("php://input");
    if (strcmp($json_input, "") !== 0) $_POST = json_decode($json_input, true);
    $_REQUEST = array_merge($_REQUEST, $_POST);
}

// Make sure an action is provided
if (!isset($_REQUEST['action'])) {
    sendError($GLOBALS['HTTP_NOT_FOUND'], 'Not Found');
    return;
}

// Make sure this is a valid action
if (!isset($routes[$_REQUEST['action']])) {
    sendError($GLOBALS['HTTP_NOT_FOUND'], 'Not Found');
    return;
}

$routes[$_REQUEST['action']]();
