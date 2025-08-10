import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import PDFTools from "./pages/PDFTools";
import ImageTools from "./pages/ImageTools";
import AudioTools from "./pages/AudioTools";
import TextTools from "./pages/TextTools";
import ProductivityTools from "./pages/ProductivityTools";
import AdminPortal from "./pages/AdminPortal";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "@/pages/not-found";

// Tool imports
// PDF Tools
import PDFToWord from "./tools/pdf/PDFToWord";
import MergePDF from "./tools/pdf/MergePDF";
import CompressPDF from "./tools/pdf/CompressPDF";
import PDFToExcel from "./tools/pdf/PDFToExcel";
import PDFToPowerPoint from "./tools/pdf/PDFToPowerPoint";
import SplitPDF from "./tools/pdf/SplitPDF";
import PDFPasswordRemover from "./tools/pdf/PDFPasswordRemover";
import PDFEditor from "./tools/pdf/PDFEditor";
import PDFToImage from "./tools/pdf/PDFToImage";
import OCRScanner from "./tools/pdf/OCRScanner";
import DigitalSignature from "./tools/pdf/DigitalSignature";
import PDFWatermark from "./tools/pdf/PDFWatermark";
import PDFRotate from "./tools/pdf/PDFRotate";
import PDFCrop from "./tools/pdf/PDFCrop";
import PDFRepair from "./tools/pdf/PDFRepair";
import PDFMetadata from "./tools/pdf/PDFMetadata";
// Image Tools
import ImageCompressor from "./tools/image/ImageCompressor";
import BackgroundRemover from "./tools/image/BackgroundRemover";
import ImageResizer from "./tools/image/ImageResizer";
import ImageConverter from "./tools/image/ImageConverter";
import PhotoEditor from "./tools/image/PhotoEditor";
import WatermarkRemover from "./tools/image/WatermarkRemover";
import ImageUpscaler from "./tools/image/ImageUpscaler";
import CollageMaker from "./tools/image/CollageMaker";
import MemeGenerator from "./tools/image/MemeGenerator";
import QRGenerator from "./tools/image/QRGenerator";
import FaviconGenerator from "./tools/image/FaviconGenerator";
import ImageFilter from "./tools/image/ImageFilter";
// Audio Tools
import AudioConverter from "./tools/audio/AudioConverter";
import AudioCompressor from "./tools/audio/AudioCompressor";
import AudioMerger from "./tools/audio/AudioMerger";
import VolumeBooster from "./tools/audio/VolumeBooster";
import AudioTrimmer from "./tools/audio/AudioTrimmer";
import VoiceRecorder from "./tools/audio/VoiceRecorder";
import TextToSpeech from "./tools/audio/TextToSpeech";
import AudioNormalizer from "./tools/audio/AudioNormalizer";
import PitchChanger from "./tools/audio/PitchChanger";
import NoiseReducer from "./tools/audio/NoiseReducer";
// Text Tools
import WordCounter from "./tools/text/WordCounter";
import GrammarChecker from "./tools/text/GrammarChecker";
import PlagiarismChecker from "./tools/text/PlagiarismChecker";
import ParaphrasingTool from "./tools/text/ParaphrasingTool";
import CaseConverter from "./tools/text/CaseConverter";
import TextSummarizer from "./tools/text/TextSummarizer";
import LoremIpsumGenerator from "./tools/text/LoremIpsumGenerator";
import MarkdownConverter from "./tools/text/MarkdownConverter";
import JSONFormatter from "./tools/text/JSONFormatter";
import PasswordGenerator from "./tools/text/PasswordGenerator";
import HashGenerator from "./tools/text/HashGenerator";
import URLEncoder from "./tools/text/URLEncoder";
// Productivity Tools
import Calculator from "./tools/productivity/Calculator";
import UnitConverter from "./tools/productivity/UnitConverter";
import ColorPicker from "./tools/productivity/ColorPicker";
import InvoiceGenerator from "./tools/productivity/InvoiceGenerator";
import QRScanner from "./tools/productivity/QRScanner";
import BarcodeGenerator from "./tools/productivity/BarcodeGenerator";
import URLShortener from "./tools/productivity/URLShortener";
import PomodoroTimer from "./tools/productivity/PomodoroTimer";
import NoteTaking from "./tools/productivity/NoteTaking";
import TaskManager from "./tools/productivity/TaskManager";
import Base64Encoder from "./tools/productivity/Base64Encoder";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/pdf-tools" component={PDFTools} />
        <Route path="/image-tools" component={ImageTools} />
        <Route path="/audio-tools" component={AudioTools} />
        <Route path="/text-tools" component={TextTools} />
        <Route path="/productivity-tools" component={ProductivityTools} />
        <Route path="/admin" component={AdminPortal} />
        <Route path="/privacy-policy" component={PrivacyPolicy} />
        <Route path="/terms-of-service" component={TermsOfService} />
        <Route path="/contact" component={Contact} />
        <Route path="/about" component={About} />
        
        {/* PDF Tools */}
        <Route path="/tools/pdf-to-word" component={PDFToWord} />
        <Route path="/tools/pdf-to-excel" component={PDFToExcel} />
        <Route path="/tools/pdf-to-powerpoint" component={PDFToPowerPoint} />
        <Route path="/tools/merge-pdf" component={MergePDF} />
        <Route path="/tools/split-pdf" component={SplitPDF} />
        <Route path="/tools/compress-pdf" component={CompressPDF} />
        <Route path="/tools/pdf-password-remover" component={PDFPasswordRemover} />
        <Route path="/tools/pdf-editor" component={PDFEditor} />
        <Route path="/tools/pdf-to-image" component={PDFToImage} />
        <Route path="/tools/ocr-scanner" component={OCRScanner} />
        <Route path="/tools/digital-signature" component={DigitalSignature} />
        <Route path="/tools/pdf-watermark" component={PDFWatermark} />
        <Route path="/tools/pdf-rotate" component={PDFRotate} />
        <Route path="/tools/pdf-crop" component={PDFCrop} />
        <Route path="/tools/pdf-repair" component={PDFRepair} />
        <Route path="/tools/pdf-metadata" component={PDFMetadata} />
        
        {/* Image Tools */}
        <Route path="/tools/image-compressor" component={ImageCompressor} />
        <Route path="/tools/background-remover" component={BackgroundRemover} />
        <Route path="/tools/image-resizer" component={ImageResizer} />
        <Route path="/tools/image-converter" component={ImageConverter} />
        <Route path="/tools/photo-editor" component={PhotoEditor} />
        <Route path="/tools/watermark-remover" component={WatermarkRemover} />
        <Route path="/tools/image-upscaler" component={ImageUpscaler} />
        <Route path="/tools/collage-maker" component={CollageMaker} />
        <Route path="/tools/meme-generator" component={MemeGenerator} />
        <Route path="/tools/qr-generator" component={QRGenerator} />
        <Route path="/tools/favicon-generator" component={FaviconGenerator} />
        <Route path="/tools/image-filter" component={ImageFilter} />
        
        {/* Audio Tools */}
        <Route path="/tools/audio-converter" component={AudioConverter} />
        <Route path="/tools/audio-compressor" component={AudioCompressor} />
        <Route path="/tools/audio-merger" component={AudioMerger} />
        <Route path="/tools/volume-booster" component={VolumeBooster} />
        <Route path="/tools/audio-trimmer" component={AudioTrimmer} />
        <Route path="/tools/voice-recorder" component={VoiceRecorder} />
        <Route path="/tools/text-to-speech" component={TextToSpeech} />
        <Route path="/tools/audio-normalizer" component={AudioNormalizer} />
        <Route path="/tools/pitch-changer" component={PitchChanger} />
        <Route path="/tools/noise-reducer" component={NoiseReducer} />
        
        {/* Text Tools */}
        <Route path="/tools/word-counter" component={WordCounter} />
        <Route path="/tools/grammar-checker" component={GrammarChecker} />
        <Route path="/tools/plagiarism-checker" component={PlagiarismChecker} />
        <Route path="/tools/paraphrasing-tool" component={ParaphrasingTool} />
        <Route path="/tools/case-converter" component={CaseConverter} />
        <Route path="/tools/text-summarizer" component={TextSummarizer} />
        <Route path="/tools/lorem-ipsum" component={LoremIpsumGenerator} />
        <Route path="/tools/markdown-converter" component={MarkdownConverter} />
        <Route path="/tools/json-formatter" component={JSONFormatter} />
        <Route path="/tools/password-generator" component={PasswordGenerator} />
        <Route path="/tools/hash-generator" component={HashGenerator} />
        <Route path="/tools/url-encoder" component={URLEncoder} />
        
        {/* Productivity Tools */}
        <Route path="/tools/calculator" component={Calculator} />
        <Route path="/tools/unit-converter" component={UnitConverter} />
        <Route path="/tools/color-picker" component={ColorPicker} />
        <Route path="/tools/invoice-generator" component={InvoiceGenerator} />
        <Route path="/tools/qr-scanner" component={QRScanner} />
        <Route path="/tools/barcode-generator" component={BarcodeGenerator} />
        <Route path="/tools/url-shortener" component={URLShortener} />
        <Route path="/tools/pomodoro-timer" component={PomodoroTimer} />
        <Route path="/tools/note-taking" component={NoteTaking} />
        <Route path="/tools/task-manager" component={TaskManager} />
        <Route path="/tools/base64-encoder" component={Base64Encoder} />
        
        {/* Admin Portal */}
        <Route path="/admin" component={AdminPortal} />
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
