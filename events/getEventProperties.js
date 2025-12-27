export function getEventProperties() {
  console.log("getEventProperties called");
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetEventPropertiesResponse xmlns="http://www.onvif.org/ver10/events/wsdl">
      <TopicNamespaceLocation>
        http://www.onvif.org/ver10/topics/topicset.xml
      </TopicNamespaceLocation>
      <FixedTopicSet>true</FixedTopicSet>
      <TopicSet />
    </GetEventPropertiesResponse>
  </s:Body>
</s:Envelope>`;
}
