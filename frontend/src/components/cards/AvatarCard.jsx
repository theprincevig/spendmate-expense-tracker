export default function AvatarCard({ avatar, style }) {
    return (
        <div className="p-1 rounded-full brand-gradient">
            {avatar ? (
                <img
                    src={avatar}
                    alt="Profile photo"
                    className={`
                        bg-white
                        border-2 border-white
                        rounded-full
                        object-cover
                        ${style}
                    `}
                />
            ) : (
                <img
                    src={"/images/avatar.png"}
                    alt="Profile photo"
                    className={`
                        bg-white
                        border-2 border-white
                        rounded-full
                        object-cover
                        ${style}
                    `}
                />
            )}
        </div>
    );
}