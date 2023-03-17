import QRCode from 'qrcode'

export const generateQRCode = async (url: string) => {
  console.log('ok')
  const qrCode = QRCode.toBuffer(url, {
    errorCorrectionLevel: 'H',
    type: 'png',
    color: {
      dark: '#000',
      light: '#fff',
    },
  })
  console.log(qrCode)
  return qrCode
}
