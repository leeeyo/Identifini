import React from 'react';
import SocialIcons from './SocialIcons';
import ActionButtons from './ActionButtons';

const Card = ({ card }) => {
  return (
    <div className="card-container" style={{
      background: `linear-gradient(-45deg, ${card.theme_color_1}, ${card.theme_color_2})`
    }}>
      <img src={card.card_pic || '/default.png'} alt={card.display_name} className="profile-pic"/>
      <h1>{card.display_name}</h1>
      <p>{card.bio}</p>
      
      <SocialIcons socialMedias={card.social_medias} />
      <ActionButtons actionButtons={card.action_buttons} />
      
      {/* Additional components like Gallery, QRCodeOverlay, WifiOverlay */}
    </div>
  );
};

export default Card;
