import Jazzicon from '@raugfer/jazzicon';

// builds an image data url for embedding
function buildDataUrl(address: string): string {
  return 'data:image/svg+xml;base64,' + btoa(Jazzicon(address));
}

// sample code for react component
export default function JazziconImage({ address }: { address: string }) {
  const imageUrl = buildDataUrl(address);
  return (
    <img src={imageUrl} alt={address} className='w-6 h-6 rounded-full'/>
  );
}