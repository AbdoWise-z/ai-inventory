import { UploadDropzone } from "@/lib/uploadthing";
import Image from "next/image";
import {FileIcon, X} from "lucide-react";
import {cn} from "@/lib/utils";

interface FileUploadProps{
  onChange: (url?: string) => void;
  value?: string;
  endpoint: "imageUploader" | "messageAttachmentUploader";
}

export const FileUpload = (
  {
    onChange,
    value,
    endpoint
  } : FileUploadProps
) => {
  if (value){
    const ft = value.split(".").pop();
    if (ft !== "pdf"){
      return <div className={cn(
        "relative h-20 w-20",
        endpoint == 'messageAttachmentUploader' && 'h-56 w-56'
      )}>
        <Image
          fill
          src={value}
          alt="Upload"
          className={cn(
            "rounded-full",
            endpoint == 'messageAttachmentUploader' && 'rounded-md'
          )}
        />

        <button onClick={() => onChange("")} className="bg-gray-800 text-white p-1 rounded-full absolute top-0 right-0 shadow-sm">
          <X className="h-5 w-5"/>
        </button>
      </div>;
    } else {
      return (
        <div className="flex relative items-center p-2 mt-2 rounded-md bg-background/10">
          <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400"/>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-sm text-indigo-500 dark:text-indigo-300 hover:underline"
          >
            {value}
          </a>

          <button
            onClick={() => onChange("")}
            className="bg-rose-500 text-white p-1 rounded-full
            absolute -top-2 -right-2 shadow-sm"
          >
            <X className="h-5 w-5"/>
          </button>
        </div>
      )
    }
  }

  return <UploadDropzone
    endpoint={endpoint}
    onClientUploadComplete={
      (res) => {
        onChange(res?.[0].url);
      }
    }
    onUploadError={
      (error: Error) => {
        console.log(error);
      }
    }
  />;
};