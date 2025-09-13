<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'phpmailer/src/Exception.php';
require 'phpmailer/src/PHPMailer.php';
require 'phpmailer/src/SMTP.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    $to = 'tbru99@gmail.com'; // company email
    $subject = $input['subject'];
    $message = $input['message'];

    $mail = new PHPMailer(true);

    try {
        // SMTP settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com';
        $mail->SMTPAuth = true;

        // 👉 Use your Gmail for testing
        $mail->Username = 'tbru99@gmail.com';  
        $mail->Password = 'rzhh hyih fypv lyor'; // NOT your Gmail password, but a Google App Password
        $mail->SMTPSecure = 'tls';
        $mail->Port = 587;

        // Sender & recipient
        $mail->setFrom('tbru99@gmail.com', 'FreshCart Orders');
        $mail->addAddress($to);

        // Email content
        $mail->isHTML(false); 
        $mail->Subject = $subject;
        $mail->Body    = $message;

        $mail->send();
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $mail->ErrorInfo]);
    }
}
