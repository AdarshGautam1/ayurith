import argparse
import sys
import os

# Add backend dir to pythonpath
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.ingestion import process_pdf
from app.models.database import init_db

def main():
    parser = argparse.ArgumentParser(description="Ingest documents into IP-SHAKTI knowledge base")
    parser.add_argument("--jurisdiction", required=True, choices=["india", "international"], help="Jurisdiction (india or international)")
    parser.add_argument("--dir", help="Directory containing documents to ingest")
    parser.add_argument("--file", help="Specific file to ingest")
    parser.add_argument("--title", help="Title of the document (required if --file is used)")
    parser.add_argument("--authority", help="Authority (required if --file is used)")
    parser.add_argument("--type", help="Document type (Act, Rule, Guideline, etc) (required if --file is used)")
    parser.add_argument("--is_demo", action="store_true", help="Mark as DEMO DATA")
    
    args = parser.parse_args()
    
    # Initialize DB (if not already done)
    init_db()
    
    if args.file:
        if not args.title or not args.authority or not args.type:
            print("Error: --title, --authority, and --type are required when --file is specified.")
            sys.exit(1)
            
        print(f"Ingesting file: {args.file}")
        chunks_count = process_pdf(
            file_path=args.file,
            jurisdiction=args.jurisdiction,
            title=args.title,
            authority=args.authority,
            document_type=args.type,
            is_demo=args.is_demo
        )
        print(f"Success! Embedded {chunks_count} chunks.")
        
    elif args.dir:
        print(f"Ingesting directory: {args.dir}")
        # Simplistic directory ingest for MVP
        for filename in os.listdir(args.dir):
            if filename.endswith(".pdf") or filename.endswith(".txt"):
                file_path = os.path.join(args.dir, filename)
                # In a real scenario, title/authority would need to be passed or extracted
                # We'll use filename for title and "Unknown" for authority for batch MVP
                print(f"Processing {filename}...")
                chunks_count = process_pdf(
                    file_path=file_path,
                    jurisdiction=args.jurisdiction,
                    title=filename.replace(".pdf", "").replace(".txt", ""),
                    authority="Unknown",
                    document_type="Document",
                    is_demo=args.is_demo
                )
                print(f"  -> Embedded {chunks_count} chunks.")
    else:
        print("Error: Must specify either --file or --dir")
        sys.exit(1)

if __name__ == "__main__":
    main()
